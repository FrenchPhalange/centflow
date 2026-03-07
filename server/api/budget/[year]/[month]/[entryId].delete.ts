import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const entryId = Number(getRouterParam(event, 'entryId'))

  if (isNaN(entryId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const db = useDB()

  const entry = await db
    .select()
    .from(budgetEntries)
    .where(eq(budgetEntries.id, entryId))
    .get()

  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Entrée non trouvée' })
  }

  if (entry.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez supprimer que vos propres entrées' })
  }

  await db.delete(budgetEntries)
    .where(and(
      eq(budgetEntries.id, entryId),
      eq(budgetEntries.userId, user.id),
    ))
    .run()

  return { ok: true }
})
