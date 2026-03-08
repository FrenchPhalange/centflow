import { useDB } from '~/server/database'
import { recurringCharges } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { validateEntry } from '~/server/utils/budget-entry-creator'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const { type, category, amount, label } = body

  if (!type || !category || amount === undefined || amount === null) {
    throw createError({ statusCode: 400, statusMessage: 'Champs requis manquants' })
  }

  const parsedAmount = Number(amount)
  validateEntry({ type, category, amount: parsedAmount })

  const db = useDB()

  const result = await db
    .insert(recurringCharges)
    .values({
      userId: user.id,
      type,
      category,
      label: label || null,
      amount: parsedAmount,
    })
    .run()

  return {
    id: Number(result.lastInsertRowid),
    userId: user.id,
    type,
    category,
    label: label || null,
    amount: parsedAmount,
    isActive: true,
  }
})
