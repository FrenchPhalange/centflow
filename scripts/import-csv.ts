import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.NUXT_TURSO_DB_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.NUXT_TURSO_AUTH_TOKEN || undefined,
})

// Trouver l'utilisateur par email (passé en argument)
const targetEmail = process.argv[3]
if (!targetEmail) {
  console.error('Usage: tsx scripts/import-csv.ts <fichier.csv> <email>')
  process.exit(1)
}

const userResult = await client.execute({
  sql: "SELECT id, name, email FROM user WHERE email = ?",
  args: [targetEmail],
})
const user = userResult.rows[0]
if (!user) { console.error('Utilisateur non trouvé'); process.exit(1) }
console.log(`Utilisateur: ${user.name} (${user.id})`)

// Lire le CSV
const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: tsx scripts/import-csv.ts <fichier.csv> <email>')
  process.exit(1)
}
const csv = readFileSync(csvPath, 'utf-8')
const lines = csv.trim().split('\n').slice(1) // skip header

interface Entry {
  date: string
  label: string
  category: string
  subcategory: string
  debit: number
  credit: number
  type: 'revenu' | 'depense'
  appCategory: string
}

// Mapping des opérations vers les catégories de l'app
function categorize(label: string, bankCat: string, bankSubCat: string, isCredit: boolean): string | null {
  const l = label.toUpperCase()

  // === Exclusions (virements internes, transferts perso) ===
  // Adaptez ces filtres à vos propres virements internes et noms de famille
  // Exemple : if (l.includes('VIREMENT VERS PRENOM')) return null
  if (bankSubCat.includes('Virement interne')) return null
  if (l.includes('CAISSE DEPARGNE') && !isCredit) return null // virement interne

  if (isCredit) {
    // === REVENUS ===
    // Adaptez le nom de votre employeur ci-dessous
    if (l.includes('MON EMPLOYEUR') && (l.includes('SALAIRE') || bankSubCat.includes('Salaires'))) return 'salaire'
    if (l.includes('MON EMPLOYEUR')) return 'salaire'
    if (bankSubCat.includes('Mutuelle')) return 'aides'
    // Adaptez les virements familiaux à vos propres noms
    if (bankSubCat.includes('Frais bancaires')) return 'autres_revenus'
    return 'autres_revenus'
  }

  // === DEPENSES ===
  // Mutuelle
  if (l.includes('AESIO') && bankSubCat.includes('Mutuelle')) return 'mutuelle'

  // Crédits / Prêts
  if (l.includes('BANQUE POPULAIRE DU SUD')) return 'credits'

  // Santé
  if (l.includes('HOPITAL') || bankSubCat.includes('Consultation medicale')) return 'sante'

  // Transport
  if (l.includes('DAC LECLERC') || bankSubCat.includes('Carburant')) return 'transport'
  if (l.includes('PEAGE') || bankSubCat.includes('Peage')) return 'transport'
  if (l.includes('PNEUS CENTER') || bankSubCat.includes('Entretien de vehicule')) return 'transport'

  // Restauration
  if (l.includes('BBM') || l.includes('CHERUBIN') || l.includes('MCDONALD') || l.includes('MC DONALD')) return 'restauration'
  if (l.includes('FIRMIN') || l.includes('ROCALYRA') || l.includes('BPR ') || l.includes('BERGERIE')) return 'restauration'
  if (l.includes('NYX CAFE') || l.includes('MARIE BLACHERE')) return 'restauration'
  if (bankSubCat.includes('Restauration rapide') || bankSubCat.includes('Restaurant')) return 'restauration'

  // Courses / Alimentation
  if (l.includes('LECLERC') && !l.includes('DAC LECLERC')) return 'courses'
  if (l.includes('CARREFOUR') || l.includes('SUPER U')) return 'courses'
  if (bankSubCat.includes('Hyper/supermarche')) return 'courses'

  // Abonnements
  if (l.includes('CLAUDE.AI') || l.includes('ANTHROPIC')) return 'abonnements'
  if (l.includes('NVIDIA')) return 'abonnements'
  if (l.includes('APPLE.COM')) return 'abonnements'
  if (l.includes('PROTON AG')) return 'abonnements'
  if (l.includes('STEAMGAMES')) return 'loisirs'
  if (l.includes('VIE4.APP')) return 'loisirs'
  if (l.includes('NAME-CHEAP')) return 'abonnements'
  if (l.includes('MAMMOUTH')) return 'abonnements'

  // Shopping
  if (l.includes('AMAZON')) return 'shopping'
  if (l.includes('DECATHLON')) return 'shopping'
  if (l.includes('PPG N LAB') || l.includes('NUTRIPURE')) return 'shopping'
  if (l.includes('NATURE DOG')) return 'shopping'
  if (l.includes('YAVIN')) return 'shopping'
  if (l.includes('UNAE LABORAT')) return 'shopping'
  if (l.includes('ARMURERIE') || l.includes('DOUCE M')) return 'shopping'
  if (l.includes('SUMUP RUNES')) return 'shopping'
  if (l.includes('LE BON COIN')) return 'shopping'
  if (bankSubCat.includes('High-Tech') || bankSubCat.includes('Shopping')) return 'shopping'

  // Loisirs
  if (l.includes('RUGBY') || l.includes('NESTOR LE CASTOR')) return 'loisirs'
  if (bankSubCat.includes('Sport') || bankSubCat.includes('Expo') || bankSubCat.includes('Video, Musique')) return 'loisirs'

  // Assurances (ne devrait pas matcher avec les catégories existantes)
  if (bankSubCat.includes('Banque et assurance')) return 'assurances'

  // Frais bancaires
  if (bankSubCat.includes('Frais bancaires')) return 'autres_depenses'

  // Espèces, divers
  if (l.includes('RETRAIT') || bankSubCat.includes('Retrait')) return 'autres_depenses'
  if (l.includes('LAPOSTE') || l.includes('COIN DES CUR')) return 'autres_depenses'
  if (l.includes('COMITE DE LIAIS') || l.includes('HELLO ASSO')) return 'autres_depenses'
  if (l.includes('FLEURS') || l.includes('REVOLUT')) return 'autres_depenses'
  if (l.includes('TRADE REPUBLIC')) return 'epargne'

  return 'autres_depenses'
}

// Parser les lignes CSV
const entries: Entry[] = []
for (const line of lines) {
  const cols = line.split(';')
  if (cols.length < 12) continue

  const [date, labelSimple, , , , , bankCat, bankSubCat, debitStr, creditStr] = cols
  const debit = debitStr ? Math.abs(parseFloat(debitStr.replace(',', '.'))) : 0
  const credit = creditStr ? parseFloat(creditStr.replace('+', '').replace(',', '.')) : 0
  const isCredit = credit > 0

  const appCat = categorize(labelSimple, bankCat, bankSubCat, isCredit)
  if (!appCat) continue // exclure

  entries.push({
    date,
    label: labelSimple,
    category: bankCat,
    subcategory: bankSubCat,
    debit,
    credit,
    type: isCredit ? 'revenu' : 'depense',
    appCategory: appCat,
  })
}

// Grouper par mois/type/catégorie et sommer
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

interface MonthKey { year: number; month: number; type: string; category: string }
const grouped = new Map<string, { key: MonthKey; total: number; details: string[] }>()

// Détecte si c'est le salaire principal (gros virement fin de mois)
// Le salaire de fin de mois = budget du mois SUIVANT
// Adaptez le nom de votre employeur ci-dessous
function isSalaireFinDeMois(label: string, amount: number, day: number): boolean {
  const l = label.toUpperCase()
  return l.includes('MON EMPLOYEUR') && amount > 500 && day >= 25
}

for (const e of entries) {
  const [dayStr, monthStr, yearStr] = e.date.split('/')
  const day = parseInt(dayStr)
  let year = parseInt(yearStr)
  let month = parseInt(monthStr) - 1 // 0-indexed pour l'app
  const amount = e.type === 'revenu' ? e.credit : e.debit

  // Décaler le salaire principal vers le mois suivant
  if (e.type === 'revenu' && e.appCategory === 'salaire' && isSalaireFinDeMois(e.label, amount, day)) {
    month += 1
    if (month > 11) { month = 0; year += 1 }
    console.log(`  ↪ Salaire ${e.date} ${amount.toFixed(2)}€ décalé → ${MONTHS[month]} ${year}`)
  }

  const mapKey = `${year}-${month}-${e.type}-${e.appCategory}`

  if (!grouped.has(mapKey)) {
    grouped.set(mapKey, {
      key: { year, month, type: e.type, category: e.appCategory },
      total: 0,
      details: [],
    })
  }
  const g = grouped.get(mapKey)!
  g.total += amount
  g.total = Math.round(g.total * 100) / 100
  g.details.push(`  ${e.date} ${e.label}: ${amount.toFixed(2)}€`)
}

// Afficher le résumé
console.log('\n=== RÉSUMÉ PAR MOIS ===\n')
const sorted = [...grouped.values()].sort((a, b) => {
  const d = (a.key.year * 12 + a.key.month) - (b.key.year * 12 + b.key.month)
  if (d !== 0) return d
  if (a.key.type !== b.key.type) return a.key.type === 'revenu' ? -1 : 1
  return a.key.category.localeCompare(b.key.category)
})

for (const { key, total, details } of sorted) {
  const icon = key.type === 'revenu' ? '💰' : '💸'
  console.log(`${icon} ${MONTHS[key.month]} ${key.year} | ${key.type.padEnd(7)} | ${key.category.padEnd(17)} | ${total.toFixed(2).padStart(10)}€`)
  for (const d of details) console.log(d)
  console.log()
}

// Insérer en base
console.log('\n=== INSERTION EN BASE ===\n')
let inserted = 0
for (const { key, total } of sorted) {
  await client.execute({
    sql: `INSERT INTO budget_entries (user_id, year, month, type, category, amount)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id, year, month, type, category)
          DO UPDATE SET amount = ?, updated_at = unixepoch()`,
    args: [user.id, key.year, key.month, key.type, key.category, total, total],
  })
  inserted++
  console.log(`✓ ${MONTHS[key.month]} ${key.year} | ${key.type} | ${key.category} = ${total.toFixed(2)}€`)
}

console.log(`\n✅ ${inserted} entrées insérées/mises à jour.`)
client.close()
