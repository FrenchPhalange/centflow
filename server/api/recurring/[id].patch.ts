import { useDB } from '~/server/database'
import { recurringCharges } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
  }

  const body = await readBody(event)
  const updates: Record<string, unknown> = {}

  if (body.amount !== undefined) {
    const parsedAmount = Number(body.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Montant invalide (doit être > 0)' })
    }
    updates.amount = parsedAmount
  }

  if (body.label !== undefined) {
    updates.label = body.label || null
  }

  if (body.isActive !== undefined) {
    updates.isActive = Boolean(body.isActive)
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification fournie' })
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
    .update(recurringCharges)
    .set({ ...updates, updatedAt: sql`(unixepoch())` })
    .where(and(eq(recurringCharges.id, id), eq(recurringCharges.userId, user.id)))
    .run()

  return { ...existing, ...updates }
})
