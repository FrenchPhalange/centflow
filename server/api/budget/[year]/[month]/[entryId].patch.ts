import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { user as userTable } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const entryId = Number(getRouterParam(event, 'entryId'))

  if (isNaN(entryId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const body = await readBody<{ amount?: number; label?: string }>(event)

  if (body.amount === undefined && body.label === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Au moins un champ requis (amount ou label)' })
  }

  if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Le montant doit être un nombre positif' })
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
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres entrées' })
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.amount !== undefined) updateData.amount = body.amount
  if (body.label !== undefined) updateData.label = body.label

  await db.update(budgetEntries)
    .set(updateData)
    .where(and(
      eq(budgetEntries.id, entryId),
      eq(budgetEntries.userId, user.id),
    ))
    .run()

  const updated = await db
    .select({
      id: budgetEntries.id,
      userId: budgetEntries.userId,
      userName: userTable.name,
      year: budgetEntries.year,
      month: budgetEntries.month,
      type: budgetEntries.type,
      category: budgetEntries.category,
      label: budgetEntries.label,
      amount: budgetEntries.amount,
    })
    .from(budgetEntries)
    .innerJoin(userTable, eq(budgetEntries.userId, userTable.id))
    .where(eq(budgetEntries.id, entryId))
    .get()

  return updated
})
