import { useDB } from '~/server/database'
import { recurringCharges } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const db = useDB()

  const existing = await db
    .select()
    .from(recurringCharges)
    .where(and(eq(recurringCharges.id, id), eq(recurringCharges.userId, user.id)))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Charge récurrente non trouvée' })
  }

  await db
    .delete(recurringCharges)
    .where(and(eq(recurringCharges.id, id), eq(recurringCharges.userId, user.id)))
    .run()

  return { ok: true }
})
