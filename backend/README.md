# Devyora Hooks — Backend (Chunk 5)

Foundational backend implementing the architecture designed in Chunks 1–2
(`BACKEND_REQUIREMENTS_MAP.md`, `BACKEND_BLUEPRINT_CHUNK2.md`). Chunk 3
built the foundation — Users/Roles, Products ("Product Knowledge"), Brand
information, Sources, Uploaded files, Historical Content, Content
performance. Chunk 4 added Content Intelligence and Planning — authorized
Instagram integration, Inspiration, Content Grids, a Knowledge Base
aggregator + cross-entity search, admin-gated deletion approvals, Content
Strategy, the Content Flowchart ("Content Plan"), and the Content Gap
Engine. Chunk 5 (this revision) adds AI Content Generation on top of all
of that, without rebuilding it: a context-aware, rule-based generator
(topic/hook/angle/script/scenes/visual direction/b-roll/CTA/caption),
versioned regeneration with a kept history, a Video Blueprint scoring
service, a content-similarity check against Historical Content, an
admin-configurable virality threshold, and a Draft→Generated→Review→
Approved→Published→Archived approval pipeline — and it's wired into the
existing frontend's Create Script and Video Blueprint UI.

## Stack

Node.js + TypeScript, Fastify, PostgreSQL + Prisma, argon2id password
hashing, DB-backed sessions (httpOnly signed cookie), local-disk file
storage behind an S3-ready provider interface, Zod validation, Vitest.

**One deliberate deviation from the Chunk 2 blueprint:** sessions live in
Postgres (`Session` model), not Redis. Redis/BullMQ isn't needed anywhere
else yet (no background jobs — AI generation, which is what would
actually need a job queue, is explicitly out of scope), so standing up a
second datastore just for sessions would be the "unnecessary
architecture" the chunk instructions warned against. Revisit when a job
queue arrives with real AI generation work.

**Instagram integration is the official "Instagram API with Instagram
Login" (Business Login) / Graph API only — never scraping.** When
`INSTAGRAM_APP_ID`/`INSTAGRAM_APP_SECRET`/`INSTAGRAM_REDIRECT_URI` aren't
set, every endpoint under `/integrations/instagram` honestly reports
`NOT_CONFIGURED` rather than fabricating connected-account data. OAuth
tokens are encrypted at rest with AES-256-GCM (`ENCRYPTION_KEY`, see
`src/lib/crypto.ts`) and synced posts are normalized into the existing
Historical Content system, never kept as a second, parallel store of
"what was published."

**AI Content Generation is a deterministic, rule-based generator — not a
call to a real language model.** It's a direct backend port of the
frontend's own former client-side placeholder (`generateScriptContent.ts`),
now driven by real stored context (Product Knowledge, Brand Rules,
Inspiration, the active Content Grid, Content Strategy, the Flowchart node
it was generated from, and the user's own instructions) instead of
client-held state. The Video Blueprint score (Virality Potential, Hook
Strength, Specificity, Brand Fit, Generic-AI detection, etc.) is computed
from real, inspectable signals in the generated text itself — word counts,
banned-phrase hits, numeric/proper-noun density, CTA verbs — and is always
an analytical estimate, never presented as a guaranteed prediction. The
content-similarity check is a Jaccard word-overlap comparison against this
workspace's real Historical Content and prior generations; it reduces
repetition, it does not guarantee uniqueness. See
`src/services/generationContent.builder.ts`,
`src/services/videoBlueprint.service.ts`, and
`src/services/similarity.service.ts`.

## Setup

```bash
cp .env.example .env   # fill in real values; .env itself is gitignored
npm install
npm run prisma:migrate   # applies migrations to the DB in .env
npm run prisma:seed      # creates the demo workspace + admin/user accounts
npm run dev               # starts the API on :4000 with auto-reload
```

Demo accounts (the frontend's login screen calls this backend for real as
of Chunk 5 — see "Frontend wiring" below):

| username | password | role  |
|----------|----------|-------|
| admin    | admin123 | admin |
| user     | user123  | user  |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + compile to `dist/` |
| `npm start` | Run the compiled server (`dist/src/server.js`) |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest, against the app via `fastify.inject()` (no network) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production-style, no shadow DB) |
| `npm run prisma:seed` | Re-run the seed (idempotent) |

## Project layout

```
src/
  config/env.ts        — validated environment (fails fast on boot if misconfigured)
  lib/                  — logger, Prisma client, error envelope, Zod parse helper, pagination, cookies
  middleware/            — requireAuth / requireRole (Fastify preHandlers)
  services/               — one file per domain; all Prisma access goes through here, never from controllers
  controllers/             — thin: parse input, call a service, shape the response
  routes/                   — route registration only, no logic
  validation/                — Zod schemas, one file per domain
  app.ts                      — Fastify instance: plugins, error handler, route registration
  server.ts                    — process entrypoint (listen, graceful shutdown)
prisma/
  schema.prisma     — see inline comments for which entities were deliberately NOT created this chunk, and why
  seed.ts
tests/
  *.test.ts          — integration tests via fastify.inject(), run against the same dev Postgres DB
storage/uploads/      — local-disk file storage root (dev default; gitignored contents)
```

## API surface

All routes under `/api/v1`, session-cookie auth unless noted.

**Chunk 3 — foundation**
- **Auth**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Products** (= Product Knowledge): `GET/POST /products`, `GET/PATCH /products/:id` (`?q=` on the list route for search)
- **Brand**: `GET/PATCH /brand`
- **Sources**: `GET/POST /sources`, `GET/DELETE /sources/:id`
- **Media**: `POST /media/upload` (multipart), `GET /media/:id/file`
- **Content History**: `GET/POST /content-history`, `GET/PATCH /content-history/:id`, `POST/GET /content-history/:id/performance`
- **Health**: `GET /health`, `GET /health/db` (no auth)

**Chunk 4 — content intelligence & planning**
- **Instagram**: `GET /integrations/instagram/status`, `POST /integrations/instagram/connect`, `GET /integrations/instagram/callback`, `POST /integrations/instagram/sync`, `DELETE /integrations/instagram`
- **Inspiration**: `GET/POST /inspiration`, `GET/PATCH/DELETE /inspiration/:id` (DELETE queues an admin-approval request)
- **Content Grids**: `GET/POST /grids`, `GET/PATCH/DELETE /grids/:id`, `POST /grids/:id/duplicate`, `POST /grids/:id/activate`, `GET/DELETE /grids/active`
- **Content Rules**: `GET/POST /content-rules`, `GET/PATCH/DELETE /content-rules/:id` (locked rules are admin-only to edit/delete; not part of the approval queue)
- **Products**: `DELETE /products/:id` now queues an admin-approval request instead of deleting immediately
- **Approvals** (admin only): `GET /approvals`, `POST /approvals/:id/approve`, `POST /approvals/:id/reject`
- **Knowledge Base**: `GET /knowledge-base/overview`, `GET /knowledge-base/search?q=`
- **Content Gap Engine**: `GET /gap-analysis?productIds=`
- **Content Strategy**: `GET/POST /strategies`, `GET/PATCH /strategies/:id`
- **Content Flowchart** (= Content Plan): `POST /strategies/:id/flowchart`, `GET /strategies/:id/flowchart`, `GET /flowcharts/:id`, `PATCH /flowcharts/:id/nodes/:nodeId`, `POST /flowcharts/:id/approve`

**Chunk 5 — AI content generation**
- **Generations**: `GET/POST /generations` (`?stage=` to filter the list), `GET /generations/:id`, `GET /generations/by-node/:nodeId`
- **Regeneration & versions**: `POST /generations/:id/regenerate` (typed or dictated `reasonOrigin`), `GET /generations/:id/versions` (every prior version kept, never overwritten)
- **Video Blueprint**: `GET /generations/:id/video-blueprint`
- **Approval pipeline**: `POST /generations/:id/approve`, `POST /generations/:id/reject`, `POST /generations/:id/save` (publishes — creates a real `ContentHistory` row with `source: GENERATED`, "Approved content entering historical Content Intelligence")
- **Virality config**: `GET /virality-config` (any authenticated user), `PATCH /virality-config` (admin only)

Every list endpoint supports `?limit=&cursor=` cursor pagination. Every
error response is `{ error: { code, message, fields? } }` — Chunk 4 added
one error code, `NOT_CONFIGURED` (501), for a real integration whose
credentials aren't set in this environment.

## Admin-approval-gated deletion

Deleting a Product, Grid Template, or Inspiration item never happens
immediately — `DELETE` on any of those queues a `PendingApproval` row
instead (idempotent: re-requesting while one is pending returns the same
request). Only an admin can resolve it via `/approvals/:id/approve` (which
performs the real deletion) or `/approvals/:id/reject` (leaves the target
untouched). See `src/services/approval.service.ts`.

## Frontend wiring (Chunk 5)

The existing frontend's **Create Script** page and **Video Blueprint**
tab, and the approval-gated **Script Generation** page (`/script/:nodeId`,
opened from an approved Content Flowchart node), now call this backend for
real — see `src/api/client.ts`, `src/api/generation.ts`,
`src/api/virality.ts`, and `src/api/products.ts` in the frontend repo.
Login/logout were swapped from the frontend's mock `authService` to the
real `/auth/login` + `/auth/logout` (a prerequisite — the generation
endpoints need a real session cookie), exactly as that file's own
pre-existing comment anticipated. Content Hub, Plan/Strategy/Flowchart,
and Settings' non-virality sections are still local-only/mock — out of
this chunk's scope — so a generation started from `/create` does a
best-effort lookup of a real backend Product by name
(`findProductIdByName`) rather than assuming Content Hub's local product
list is backed by real rows.

## Known gaps / next-chunk work

- No real S3 provider yet (`StorageProvider` interface is ready for one — see `src/services/storage.service.ts`)
- No source content extraction (OCR/transcription) — explicitly deferred
- Instagram's OAuth token exchange and media sync call the real Graph API and can't be exercised in tests without live app credentials — see `tests/instagram.test.ts` for what is covered (status, honest "not configured" behavior, disconnect)
- Content Hub, Plan (Strategy/Flowchart generation UI), and Product Knowledge CRUD are still frontend-local/mock — not yet wired to this backend
- No real generative-AI model is called anywhere — generation and scoring are both deterministic and rule-based by design (see above)
