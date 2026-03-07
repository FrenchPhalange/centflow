import { useServerAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Skip auth for Better Auth routes, public assets, and PWA files
  if (
    url.pathname.startsWith('/api/auth/') ||
    url.pathname === '/api/_session' ||
    url.pathname.startsWith('/_nuxt') ||
    url.pathname.startsWith('/__nuxt') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/sw.js' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    return
  }

  // Protect all API routes
  if (url.pathname.startsWith('/api/')) {
    const auth = useServerAuth()
    const session = await auth.api.getSession({
      headers: event.headers,
    })
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
    }
  }
})
