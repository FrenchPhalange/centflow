import { useServerAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const auth = useServerAuth()
    const session = await auth.api.getSession({
      headers: event.headers,
    })
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      }
    }
  } catch {
    // Session invalid or no session
  }
  return { user: null }
})
