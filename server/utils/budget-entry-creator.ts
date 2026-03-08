import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from '~/shared/constants'

export interface CreateEntryInput {
  userId: string
  userName: string
  year: number
  month: number
  type: 'revenu' | 'depense'
  category: string
  label?: string | null
  amount: number
}

export function validateEntry(input: { type: string; category: string; amount: number }) {
  if (input.type !== 'revenu' && input.type !== 'depense') {
    throw createError({ statusCode: 400, statusMessage: 'Type invalide' })
  }

  const validCategories: string[] = input.type === 'revenu'
    ? REVENUE_CATEGORIES.map(c => c.key)
    : EXPENSE_CATEGORIES.map(c => c.key)

  if (!validCategories.includes(input.category)) {
    throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
  }

  if (isNaN(input.amount) || input.amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant invalide (doit être > 0)' })
  }
}

export async function createBudgetEntry(input: CreateEntryInput) {
  const db = useDB()

  const result = await db
    .insert(budgetEntries)
    .values({
      userId: input.userId,
      year: input.year,
      month: input.month,
      type: input.type,
      category: input.category,
      label: input.label || null,
      amount: input.amount,
    })
    .run()

  return {
    id: Number(result.lastInsertRowid),
    userId: input.userId,
    userName: input.userName,
    year: input.year,
    month: input.month,
    type: input.type,
    category: input.category,
    label: input.label || null,
    amount: input.amount,
  }
}
