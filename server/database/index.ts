import { createClient, type Client } from '@libsql/client/http'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null
let _client: Client | null = null

function getConnectionConfig() {
  try {
    const config = useRuntimeConfig()
    return {
      url: config.tursoDbUrl,
      authToken: config.tursoAuthToken || undefined,
    }
  } catch {
    return {
      url: process.env.NUXT_TURSO_DB_URL || 'file:./data/budget.db',
      authToken: process.env.NUXT_TURSO_AUTH_TOKEN || undefined,
    }
  }
}

export function useDB() {
  if (!_db) {
    const { url, authToken } = getConnectionConfig()
    _client = createClient({ url, authToken })
    _db = drizzle(_client, { schema })
  }
  return _db
}
