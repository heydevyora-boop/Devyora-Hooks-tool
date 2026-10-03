import { buildApp } from '../src/app.js'

export type App = Awaited<ReturnType<typeof buildApp>>

/** Pulls the signed session cookie out of a login response's Set-Cookie
 * header so subsequent injected requests can authenticate as that user. */
export function extractSessionCookie(setCookieHeader: string | string[] | undefined): string {
  const header = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
  if (!header) throw new Error('No Set-Cookie header on login response')
  return header.split(';')[0]!
}

export async function loginAs(app: App, username: string, password: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { username, password },
  })
  if (response.statusCode !== 200) {
    throw new Error(`Login failed for ${username}: ${response.statusCode} ${response.body}`)
  }
  return extractSessionCookie(response.headers['set-cookie'])
}

export { buildApp }
