import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { eq, and, or } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, MONTHS_SHORT } from '~/shared/constants'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))
  const month = Number(getRouterParam(event, 'month'))

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    throw createError({ statusCode: 400, statusMessage: 'Année ou mois invalide' })
  }

  // Compute 6-month window (current month + 5 months back)
  const months: Array<{ year: number; month: number; label: string }> = []
  for (let i = 5; i >= 0; i--) {
    let m = month - i
    let y = year
    if (m < 0) {
      m += 12
      y -= 1
    }
    months.push({ year: y, month: m, label: MONTHS_SHORT[m] as string })
  }

  const db = useDB()

  // Build OR conditions for each (year, month) pair
  const monthConditions = months.map(({ year: y, month: m }) =>
    and(eq(budgetEntries.year, y), eq(budgetEntries.month, m))
  )

  // Query all expense entries in the window
  const entries = await db
    .select({
      year: budgetEntries.year,
      month: budgetEntries.month,
      category: budgetEntries.category,
      amount: budgetEntries.amount,
    })
    .from(budgetEntries)
    .where(and(
      eq(budgetEntries.type, 'depense'),
      or(...monthConditions),
    ))
    .all()

  // Group by (year, month, category) and sum amounts
  const grouped = new Map<string, number>()
  for (const entry of entries) {
    const key = `${entry.year}-${entry.month}-${entry.category}`
    grouped.set(key, (grouped.get(key) || 0) + entry.amount)
  }

  // Build category data arrays
  const categories = EXPENSE_CATEGORIES.map(cat => {
    const data = months.map(m => {
      const key = `${m.year}-${m.month}-${cat.key}`
      return grouped.get(key) || 0
    })
    return {
      key: cat.key,
      label: cat.label,
      color: CATEGORY_COLORS[cat.key] || '#888',
      data,
    }
  }).filter(cat => cat.data.some(v => v > 0))

  return {
    months: months.map(m => ({ year: m.year, month: m.month, label: m.label })),
    categories,
  }
})
