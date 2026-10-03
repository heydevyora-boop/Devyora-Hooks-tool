# Devyora Hooks — Backend (Chunk 3)

Foundational backend implementing the architecture designed in Chunks 1–2
(`BACKEND_REQUIREMENTS_MAP.md`, `BACKEND_BLUEPRINT_CHUNK2.md`). Scope is
intentionally limited to what Chunk 3 asked for — Users/Roles, Products
("Product Knowledge"), Brand information, Sources, Uploaded files,
Historical Content, Content performance. No AI generation, no grids,
strategies, flowcharts, or approvals yet — those are later chunks.

## Stack

Node.js + TypeScript, Fastify, PostgreSQL + Prisma, argon2id password
hashing, DB-backed sessions (httpOnly signed cookie), local-disk file
storage behind an S3-ready provider interface, Zod validation, Vitest.

**One deliberate deviation from the Chunk 2 blueprint:** sessions live in
Postgres (`Session` model), not Redis. Redis/BullMQ isn't needed anywhere
else yet (no background jobs this chunk — AI generation, which is what
would actually need a job queue, is explicitly out of scope), so standing
up a second datastore just for sessions would be the "unnecessary
architecture" the chunk instructions warned against. Revisit when a job
queue arrives with real AI generation work.

## Setup

```bash
cp .env.example .env   # fill in real values; .env itself is gitignored
npm install
npm run prisma:migrate   # applies migrations to the DB in .env
npm run prisma:seed      # creates the demo workspace + admin/user accounts
npm run dev               # starts the API on :4000 with auto-reload
```

Demo accounts (match the existing frontend's `authService.ts` exactly, so
the real login screen works against this backend with zero frontend
changes once it's wired up):

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

## API surface this chunk

All routes under `/api/v1`, session-cookie auth unless noted.

- **Auth**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Products** (= Product Knowledge): `GET/POST /products`, `GET/PATCH /products/:id` (`?q=` on the list route for search)
- **Brand**: `GET/PATCH /brand`
- **Sources**: `GET/POST /sources`, `GET/DELETE /sources/:id`
- **Media**: `POST /media/upload` (multipart), `GET /media/:id/file`
- **Content History**: `GET/POST /content-history`, `GET/PATCH /content-history/:id`, `POST/GET /content-history/:id/performance`
- **Health**: `GET /health`, `GET /health/db` (no auth)

Every list endpoint supports `?limit=&cursor=` cursor pagination. Every
error response is `{ error: { code, message, fields? } }`.

## Known gaps / next-chunk work

- No real S3 provider yet (`StorageProvider` interface is ready for one — see `src/services/storage.service.ts`)
- No source content extraction (OCR/transcription) — explicitly deferred per this chunk's scope
- No DELETE on products (that routes through the admin-approval queue, which doesn't exist yet — later chunk)
- Frontend is not yet wired to call this backend (that's a frontend-side change, out of scope for a backend chunk) — see `BACKEND_BLUEPRINT_CHUNK2.md` §10 for the exact contract each frontend type maps to
