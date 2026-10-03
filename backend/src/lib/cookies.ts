export const SESSION_COOKIE_NAME = 'devyora_session'

export const sessionCookieOptions = (maxAgeSeconds: number, isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  signed: true,
  maxAge: maxAgeSeconds,
})
