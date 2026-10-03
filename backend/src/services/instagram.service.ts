import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import { encryptSecret, decryptSecret } from '../lib/crypto.js'
import { ConflictError, NotConfiguredError, NotFoundError } from '../lib/errors.js'
import type { InstagramCallbackQuery } from '../validation/instagram.schema.js'
import type { InstagramConnection, InstagramMediaType, InstagramPost } from '@prisma/client'

/**
 * Official "Instagram API with Instagram Login" (Business Login) only —
 * no scraping anywhere. See README "Instagram integration" for the exact
 * scopes/endpoints. When INSTAGRAM_APP_ID/SECRET/REDIRECT_URI aren't set
 * (env.isInstagramConfigured === false), every entry point here throws
 * NotConfiguredError instead of returning invented account data.
 */
const GRAPH_VERSION = 'v21.0'
const OAUTH_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize'
const OAUTH_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
const GRAPH_BASE = 'https://graph.instagram.com'
const OAUTH_SCOPES = 'instagram_business_basic,instagram_business_manage_insights'

const STATUS_FROM_DB: Record<InstagramConnection['status'], 'not_connected' | 'connecting' | 'connected' | 'syncing'> = {
  NOT_CONNECTED: 'not_connected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  SYNCING: 'syncing',
  // The connection itself isn't gone on a sync failure — only the sync
  // attempt failed. Surfacing it as still "connected" (with lastSyncError)
  // matches the frontend's four-state model without inventing a fifth.
  ERROR: 'connected',
}

type ConnectionWithPosts = InstagramConnection & {
  posts: (InstagramPost & {
    contentHistory:
      | {
          title: string
          format: string
          publishedDate: Date
          performanceSnapshots: { views: number | null; likes: number | null }[]
        }
      | null
  })[]
}

/** Matches contentHistory.service.ts's FORMAT_FROM_DB display casing. */
const FORMAT_DISPLAY: Record<string, string> = { REEL: 'Reel', CAROUSEL: 'Carousel', STATIC: 'Static', STORY: 'Story', VIDEO: 'Video' }

function engagementLabel(snapshot?: { views: number | null; likes: number | null }): string | undefined {
  if (!snapshot) return undefined
  if (snapshot.views !== null && snapshot.views !== undefined) return `${snapshot.views.toLocaleString()} views`
  if (snapshot.likes !== null && snapshot.likes !== undefined) return `${snapshot.likes.toLocaleString()} likes`
  return undefined
}

function toConnectionView(connection: ConnectionWithPosts | null) {
  if (!connection || connection.status === 'NOT_CONNECTED') {
    return { status: 'not_connected' as const }
  }

  const topPerformingContent = connection.posts
    .filter((post) => post.contentHistory)
    .sort((a, b) => (b.contentHistory!.performanceSnapshots[0]?.views ?? 0) - (a.contentHistory!.performanceSnapshots[0]?.views ?? 0))
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.contentHistory!.title,
      format: FORMAT_DISPLAY[post.contentHistory!.format] ?? post.contentHistory!.format,
      date: post.contentHistory!.publishedDate.toISOString().slice(0, 10),
      engagement: engagementLabel(post.contentHistory!.performanceSnapshots[0]),
    }))

  return {
    status: STATUS_FROM_DB[connection.status],
    handle: connection.handle ?? undefined,
    followers: connection.followersCount ?? undefined,
    posts: connection.postsCount ?? undefined,
    reels: connection.reelsCount ?? undefined,
    postingFrequency: connection.postingFrequency ?? undefined,
    lastSyncedAt: connection.lastSyncedAt?.toISOString(),
    topPerformingContent: topPerformingContent.length > 0 ? topPerformingContent : undefined,
    // Extra field beyond the frontend's strict InstagramConnection type —
    // additive only, safe for a client that ignores unknown fields.
    lastSyncError: connection.status === 'ERROR' ? connection.lastSyncError ?? undefined : undefined,
  }
}

async function findConnectionWithPosts(workspaceId: string) {
  return prisma.instagramConnection.findUnique({
    where: { workspaceId },
    include: {
      posts: {
        include: {
          contentHistory: {
            select: {
              title: true,
              format: true,
              publishedDate: true,
              performanceSnapshots: { orderBy: { capturedAt: 'desc' }, take: 1 },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })
}

export async function getStatus(workspaceId: string) {
  const connection = await findConnectionWithPosts(workspaceId)
  return toConnectionView(connection)
}

export async function startConnect(workspaceId: string, userId: string) {
  if (!env.isInstagramConfigured) {
    throw new NotConfiguredError(
      'Instagram integration is not configured for this environment. Set INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET and INSTAGRAM_REDIRECT_URI to enable it.',
    )
  }

  const oauthState = randomUUID()
  await prisma.instagramConnection.upsert({
    where: { workspaceId },
    create: { workspaceId, status: 'CONNECTING', oauthState, connectedBy: userId },
    update: { status: 'CONNECTING', oauthState, connectedBy: userId, lastSyncError: null },
  })

  const authorizeUrl = new URL(OAUTH_AUTHORIZE_URL)
  authorizeUrl.searchParams.set('client_id', env.INSTAGRAM_APP_ID!)
  authorizeUrl.searchParams.set('redirect_uri', env.INSTAGRAM_REDIRECT_URI!)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('scope', OAUTH_SCOPES)
  authorizeUrl.searchParams.set('state', oauthState)

  return { oauthUrl: authorizeUrl.toString() }
}

async function exchangeCodeForToken(code: string) {
  const form = new URLSearchParams({
    client_id: env.INSTAGRAM_APP_ID!,
    client_secret: env.INSTAGRAM_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: env.INSTAGRAM_REDIRECT_URI!,
    code,
  })
  const response = await fetch(OAUTH_TOKEN_URL, { method: 'POST', body: form })
  if (!response.ok) {
    throw new Error(`Instagram token exchange failed: ${response.status} ${await response.text()}`)
  }
  const data = (await response.json()) as { access_token: string; user_id: string }

  // Short-lived tokens (~1hr) must be exchanged for a long-lived one
  // (~60 days) before storing — otherwise the connection would need
  // re-authorization constantly.
  const longLivedUrl = new URL(`${GRAPH_BASE}/access_token`)
  longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token')
  longLivedUrl.searchParams.set('client_secret', env.INSTAGRAM_APP_SECRET!)
  longLivedUrl.searchParams.set('access_token', data.access_token)
  const longLivedResponse = await fetch(longLivedUrl.toString())
  if (!longLivedResponse.ok) {
    throw new Error(`Instagram long-lived token exchange failed: ${longLivedResponse.status}`)
  }
  const longLived = (await longLivedResponse.json()) as { access_token: string; expires_in: number }

  return { accessToken: longLived.access_token, expiresInSeconds: longLived.expires_in }
}

async function fetchAccountMetadata(accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/${GRAPH_VERSION}/me`)
  url.searchParams.set('fields', 'user_id,username,media_count')
  url.searchParams.set('access_token', accessToken)
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Instagram account lookup failed: ${response.status}`)
  }
  return (await response.json()) as { user_id: string; username: string; media_count: number }
}

export async function completeConnect(workspaceId: string, query: InstagramCallbackQuery) {
  const connection = await prisma.instagramConnection.findUnique({ where: { workspaceId } })
  if (!connection) throw new NotFoundError('No pending Instagram connection for this workspace')

  if (query.error || !query.code) {
    await prisma.instagramConnection.update({
      where: { workspaceId },
      data: { status: 'ERROR', lastSyncError: query.error_description ?? query.error ?? 'Authorization was not completed' },
    })
    return toConnectionView(await findConnectionWithPosts(workspaceId))
  }

  if (!query.state || query.state !== connection.oauthState) {
    throw new ConflictError('Instagram OAuth state mismatch — please reconnect')
  }

  const { accessToken, expiresInSeconds } = await exchangeCodeForToken(query.code)
  const account = await fetchAccountMetadata(accessToken)

  await prisma.instagramConnection.update({
    where: { workspaceId },
    data: {
      status: 'CONNECTED',
      handle: account.username,
      externalAccountId: account.user_id,
      accessTokenCipher: encryptSecret(accessToken),
      tokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      postsCount: account.media_count,
      oauthState: null,
      lastSyncError: null,
    },
  })

  return toConnectionView(await findConnectionWithPosts(workspaceId))
}

function mediaTypeFromGraph(mediaType: string, mediaProductType: string | undefined): InstagramMediaType {
  if (mediaProductType === 'REELS') return 'REEL'
  if (mediaType === 'CAROUSEL_ALBUM') return 'CAROUSEL'
  if (mediaType === 'VIDEO') return 'REEL'
  return 'STATIC'
}

const FORMAT_FOR_HISTORY: Record<InstagramMediaType, 'REEL' | 'CAROUSEL' | 'STATIC' | 'STORY'> = {
  REEL: 'REEL',
  CAROUSEL: 'CAROUSEL',
  STATIC: 'STATIC',
  STORY: 'STORY',
}

interface GraphMediaItem {
  id: string
  caption?: string
  media_type: string
  media_product_type?: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

async function fetchRecentMedia(accessToken: string): Promise<GraphMediaItem[]> {
  const url = new URL(`${GRAPH_BASE}/${GRAPH_VERSION}/me/media`)
  url.searchParams.set(
    'fields',
    'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
  )
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('limit', '50')
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Instagram media fetch failed: ${response.status}`)
  }
  const data = (await response.json()) as { data: GraphMediaItem[] }
  return data.data
}

/** Real average over the synced window — never a guessed/rounded display string. */
function computePostingFrequency(publishedDates: Date[]): string | null {
  if (publishedDates.length < 2) return null
  const sorted = [...publishedDates].sort((a, b) => a.getTime() - b.getTime())
  const spanDays = (sorted[sorted.length - 1]!.getTime() - sorted[0]!.getTime()) / 86_400_000
  if (spanDays <= 0) return null
  const perWeek = (sorted.length / spanDays) * 7
  return `${perWeek.toFixed(1)}x / week`
}

/**
 * Normalizes newly-synced InstagramPost rows into the existing Historical
 * Content system (ContentHistory + an initial ContentPerformance snapshot)
 * — per the explicit instruction to reuse that system rather than keep
 * Instagram content as a second, parallel store of "what was published."
 */
async function normalizeIntoHistory(workspaceId: string, post: InstagramPost & { id: string }) {
  if (post.contentHistoryId) return

  const format = FORMAT_FOR_HISTORY[post.mediaType]
  const title = post.caption ? post.caption.slice(0, 80) : `Instagram ${format.toLowerCase()} — ${post.externalPostId}`

  const history = await prisma.contentHistory.create({
    data: {
      workspaceId,
      title,
      topic: '',
      format,
      platform: 'instagram',
      publishedDate: post.publishedAt,
      hook: post.caption ?? undefined,
      status: 'PUBLISHED',
      source: 'INSTAGRAM_SYNC',
    },
  })

  await prisma.instagramPost.update({ where: { id: post.id }, data: { contentHistoryId: history.id } })
}

export async function sync(workspaceId: string) {
  const connection = await prisma.instagramConnection.findUnique({ where: { workspaceId } })
  if (!connection || !connection.accessTokenCipher) {
    throw new ConflictError('Instagram is not connected for this workspace')
  }

  await prisma.instagramConnection.update({ where: { workspaceId }, data: { status: 'SYNCING' } })

  try {
    const accessToken = decryptSecret(connection.accessTokenCipher)
    const media = await fetchRecentMedia(accessToken)

    let reelsCount = 0
    for (const item of media) {
      const mediaType = mediaTypeFromGraph(item.media_type, item.media_product_type)
      if (mediaType === 'REEL') reelsCount += 1

      const post = await prisma.instagramPost.upsert({
        where: { instagramConnectionId_externalPostId: { instagramConnectionId: connection.id, externalPostId: item.id } },
        create: {
          instagramConnectionId: connection.id,
          externalPostId: item.id,
          mediaType,
          mediaUrl: item.media_url,
          thumbnailUrl: item.thumbnail_url,
          caption: item.caption,
          permalink: item.permalink,
          publishedAt: new Date(item.timestamp),
        },
        update: {
          mediaUrl: item.media_url,
          thumbnailUrl: item.thumbnail_url,
          caption: item.caption,
          permalink: item.permalink,
          syncedAt: new Date(),
        },
      })

      await normalizeIntoHistory(workspaceId, post)

      if (post.contentHistoryId && (item.like_count !== undefined || item.comments_count !== undefined)) {
        await prisma.contentPerformance.create({
          data: {
            contentHistoryId: post.contentHistoryId,
            likes: item.like_count,
            comments: item.comments_count,
            source: 'INSTAGRAM_SYNC',
          },
        })
      }
    }

    const postingFrequency = computePostingFrequency(media.map((item) => new Date(item.timestamp)))

    await prisma.instagramConnection.update({
      where: { workspaceId },
      data: {
        status: 'CONNECTED',
        postsCount: media.length,
        reelsCount,
        postingFrequency: postingFrequency ?? connection.postingFrequency,
        lastSyncedAt: new Date(),
        lastSyncError: null,
      },
    })
  } catch (error) {
    await prisma.instagramConnection.update({
      where: { workspaceId },
      data: { status: 'ERROR', lastSyncError: error instanceof Error ? error.message : 'Sync failed' },
    })
    throw error
  }

  return toConnectionView(await findConnectionWithPosts(workspaceId))
}

export async function disconnect(workspaceId: string) {
  const existing = await prisma.instagramConnection.findUnique({ where: { workspaceId } })
  if (!existing) return
  // Cascades to InstagramPost rows (see schema); linked ContentHistory
  // rows are left in place — they're real historical content, not an
  // artifact of the connection itself.
  await prisma.instagramConnection.delete({ where: { workspaceId } })
}
