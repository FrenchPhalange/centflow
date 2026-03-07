import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from '~/shared/constants'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))
  const month = Number(getRouterParam(event, 'month'))

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    throw createError({ statusCode: 400, statusMessage: 'Année ou mois invalide' })
  }

  const body = await readBody(event)
  const { type, category, amount, label } = body

  if (!type || !category || amount === undefined || amount === null) {
    throw createError({ statusCode: 400, statusMessage: 'Champs requis manquants' })
  }

  if (type !== 'revenu' && type !== 'depense') {
    throw createError({ statusCode: 400, statusMessage: 'Type invalide' })
  }

  const validCategories = type === 'revenu'
    ? REVENUE_CATEGORIES.map(c => c.key)
    : EXPENSE_CATEGORIES.map(c => c.key)

  if (!validCategories.includes(category)) {
    throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
  }

  const parsedAmount = Number(amount)
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide (doit être > 0)' })
  }

  const db = useDB()

  const result = await db
    .insert(budgetEntries)
    .values({
      userId: user.id,
      year,
      month,
      type,
      category,
      label: label || null,
      amount: parsedAmount,
    })
    .run()

  return {
    id: Number(result.lastInsertRowid), userId: user.id, userName: user.name,
    year, month, type, category, label: label || null, amount: parsedAmount,
  }
})
