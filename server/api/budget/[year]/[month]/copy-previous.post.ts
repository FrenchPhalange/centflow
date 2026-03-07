import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))
  const month = Number(getRouterParam(event, 'month'))

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    throw createError({ statusCode: 400, statusMessage: 'Année ou mois invalide' })
  }

  // Calculate previous month
  let prevYear = year
  let prevMonth = month - 1
  if (prevMonth < 0) {
    prevMonth = 11
    prevYear = year - 1
  }

  const db = useDB()

  // Check if target month already has entries for this user
  const existingEntries = await db
    .select()
    .from(budgetEntries)
    .where(and(
      eq(budgetEntries.userId, user.id),
      eq(budgetEntries.year, year),
      eq(budgetEntries.month, month),
    ))
    .all()

  if (existingEntries.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Ce mois contient déjà des entrées' })
  }

  const previousEntries = await db
    .select()
    .from(budgetEntries)
    .where(and(
      eq(budgetEntries.userId, user.id),
      eq(budgetEntries.year, prevYear),
      eq(budgetEntries.month, prevMonth),
    ))
    .all()

  if (previousEntries.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Aucune donnée le mois précédent' })
  }

  let copied = 0
  for (const entry of previousEntries) {
    await db.insert(budgetEntries)
      .values({
        userId: user.id,
        year,
        month,
        type: entry.type,
        category: entry.category,
        label: entry.label,
        amount: entry.amount,
      })
      .run()
    copied++
  }

  return { copied, total: previousEntries.length }
})
