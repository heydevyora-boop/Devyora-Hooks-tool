// Vercel serverless entrypoint for the existing backend (backend/src/app.ts).
// Catches every request under /api/v1/* and hands it to the same Fastify
// app that already runs locally via `backend/src/server.ts` — no routes,
// auth logic, or behavior are duplicated or changed here.
//
// Requires `backend/dist/src/app.js` to exist, which the project's
// `vercel.json` buildCommand produces (`cd backend && npm run build`).
import { buildApp } from '../../backend/dist/src/app.js'

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
