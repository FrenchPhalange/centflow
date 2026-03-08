import { useDB } from '~/server/database'
import { recurringCharges, budgetEntries } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'
import { createBudgetEntry } from '~/server/utils/budget-entry-creator'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))
  const month = Number(getRouterParam(event, 'month'))

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    throw createError({ statusCode: 400, statusMessage: 'Année ou mois invalide' })
  }

  const db = useDB()

  const activeCharges = await db
    .select()
    .from(recurringCharges)
    .where(and(
      eq(recurringCharges.userId, user.id),
      eq(recurringCharges.isActive, true),
    ))
    .all()

  if (activeCharges.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Aucune charge récurrente active' })
  }

  const existingEntries = await db
    .select()
    .from(budgetEntries)
    .where(and(
      eq(budgetEntries.userId, user.id),
      eq(budgetEntries.year, year),
      eq(budgetEntries.month, month),
    ))
    .all()

  let applied = 0
  let skipped = 0

  for (const charge of activeCharges) {
    const duplicate = existingEntries.find(e =>
      e.type === charge.type
      && e.category === charge.category
      && (e.label || null) === (charge.label || null),
    )

    if (duplicate) {
      skipped++
      continue
    }

    await createBudgetEntry({
      userId: user.id,
      userName: user.name,
      year,
      month,
      type: charge.type as 'revenu' | 'depense',
      category: charge.category,
      label: charge.label,
      amount: charge.amount,
    })
    applied++
  }

  return { applied, skipped, total: activeCharges.length }
})
