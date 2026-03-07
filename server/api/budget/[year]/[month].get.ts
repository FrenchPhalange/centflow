import { useDB } from '~/server/database'
import { budgetEntries, user } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))
  const month = Number(getRouterParam(event, 'month'))

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    throw createError({ statusCode: 400, statusMessage: 'Année ou mois invalide' })
  }

  const db = useDB()

  const entries = await db
    .select({
      id: budgetEntries.id,
      userId: budgetEntries.userId,
      userName: user.name,
      year: budgetEntries.year,
      month: budgetEntries.month,
      type: budgetEntries.type,
      category: budgetEntries.category,
      label: budgetEntries.label,
      amount: budgetEntries.amount,
    })
    .from(budgetEntries)
    .innerJoin(user, eq(budgetEntries.userId, user.id))
    .where(and(
      eq(budgetEntries.year, year),
      eq(budgetEntries.month, month),
    ))
    .all()

  const totalRevenus = entries
    .filter(e => e.type === 'revenu')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalDepenses = entries
    .filter(e => e.type === 'depense')
    .reduce((sum, e) => sum + e.amount, 0)

  return {
    entries,
    totalRevenus,
    totalDepenses,
    solde: totalRevenus - totalDepenses,
  }
})
