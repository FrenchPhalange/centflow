import { useDB } from '~/server/database'
import { budgetEntries } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const year = Number(getRouterParam(event, 'year'))

  if (isNaN(year)) {
    throw createError({ statusCode: 400, statusMessage: 'Année invalide' })
  }

  const db = useDB()

  const entries = await db
    .select()
    .from(budgetEntries)
    .where(eq(budgetEntries.year, year))
    .all()

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = entries.filter(e => e.month === i)
    const totalRevenus = monthEntries
      .filter(e => e.type === 'revenu')
      .reduce((sum, e) => sum + e.amount, 0)
    const totalDepenses = monthEntries
      .filter(e => e.type === 'depense')
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      month: i,
      totalRevenus,
      totalDepenses,
      solde: totalRevenus - totalDepenses,
    }
  })

  const totalRevenus = months.reduce((sum, m) => sum + m.totalRevenus, 0)
  const totalDepenses = months.reduce((sum, m) => sum + m.totalDepenses, 0)
  const activeMonths = months.filter(m => m.totalRevenus > 0 || m.totalDepenses > 0).length

  return {
    months,
    totalRevenus,
    totalDepenses,
    solde: totalRevenus - totalDepenses,
    moyenneMensuelle: activeMonths > 0 ? (totalRevenus - totalDepenses) / activeMonths : 0,
  }
})
