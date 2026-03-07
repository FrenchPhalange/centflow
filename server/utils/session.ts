import type { H3Event } from 'h3'
import { useServerAuth } from '~/server/utils/auth'

export interface SessionUser {
  id: string
  name: string
  email: string
}

export async function requireAuth(event: H3Event): Promise<SessionUser> {
  const auth = useServerAuth()
  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  }
}
