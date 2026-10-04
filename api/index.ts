// Vercel serverless entrypoint for the existing backend (backend/src/app.ts).
// vercel.json rewrites every /api/v1/* request to this single function,
// which hands it to the same Fastify app that already runs locally via
// `backend/src/server.ts` — no routes, auth logic, or behavior are
// duplicated or changed here. Fastify reads the real path from the
// (rewrite-preserved) request object, so it still routes /api/v1/auth/login
// to the real auth route internally.
//
// Requires `backend/dist/src/app.js` to exist, which the project's
// `vercel.json` buildCommand produces (`cd backend && npm run build`).
import { buildApp } from '../backend/dist/src/app.js'

let appPromise: ReturnType<typeof buildApp> | undefined

function getApp() {
  if (!appPromise) appPromise = buildApp()
  return appPromise
}

export default async function handler(req: any, res: any) {
  const app = await getApp()
  await app.ready()
  app.server.emit('request', req, res)
}
