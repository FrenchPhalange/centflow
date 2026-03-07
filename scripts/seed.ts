import { createClient } from '@libsql/client'
import * as readline from 'readline'
import { randomUUID } from 'crypto'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.NUXT_TURSO_DB_URL || 'file:./data/budget.db',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.NUXT_TURSO_AUTH_TOKEN || undefined,
})

// Create tables
const statements = [
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS budget_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES user(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenu', 'depense')),
    category TEXT NOT NULL,
    label TEXT,
    amount REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS budget_entry_unique
    ON budget_entries(user_id, year, month, type, category)`,
]

for (const sql of statements) {
  await client.execute(sql)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()))
  })
}

async function seedUser(number: number) {
  console.log(`\n--- Utilisateur ${number} ---`)
  const name = await ask('Prénom : ')
  const email = await ask('Email : ')

  const id = randomUUID()

  try {
    await client.execute({
      sql: 'INSERT INTO user (id, name, email, email_verified) VALUES (?, ?, ?, 1)',
      args: [id, name, email],
    })
    console.log(`✓ Utilisateur "${name}" <${email}> créé.`)
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      console.log(`⚠ L'email "${email}" existe déjà, mise à jour...`)
      await client.execute({
        sql: 'UPDATE user SET name = ?, updated_at = unixepoch() WHERE email = ?',
        args: [name, email],
      })
      console.log(`✓ Utilisateur "${name}" mis à jour.`)
    } else {
      throw err
    }
  }
}

async function main() {
  console.log('🏠 Centflow — Création des comptes (Magic Link)')
  console.log('======================================================')
  console.log('Pas de mot de passe nécessaire ! La connexion se fait par magic link.')
  console.log('')

  await seedUser(1)
  await seedUser(2)

  console.log('\n✅ Seed terminé ! Les 2 comptes sont prêts.')
  rl.close()
  client.close()
}

main().catch((err) => {
  console.error('Erreur:', err)
  process.exit(1)
})
