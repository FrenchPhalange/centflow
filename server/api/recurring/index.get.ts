import { useDB } from '~/server/database'
import { recurringCharges } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()

  return db
    .select()
    .from(recurringCharges)
    .where(eq(recurringCharges.userId, user.id))
    .all()
})
