export const REVENUE_CATEGORIES = [
  { key: 'salaire', label: 'Salaire', icon: 'i-lucide-banknote', hint: 'Salaire net mensuel' },
  { key: 'prime', label: 'Prime', icon: 'i-lucide-gift', hint: 'Primes, bonus' },
  { key: 'aides', label: 'Aides', icon: 'i-lucide-heart-handshake', hint: 'Mutuelle, remboursements' },
  { key: 'autres_revenus', label: 'Autres revenus', icon: 'i-lucide-plus-circle', hint: 'Famille, freelance, divers' },
] as const

export const EXPENSE_CATEGORIES = [
  { key: 'loyer', label: 'Loyer', icon: 'i-lucide-home', hint: 'Loyer, charges' },
  { key: 'energie', label: 'Énergie', icon: 'i-lucide-zap', hint: 'EDF, gaz, eau' },
  { key: 'courses', label: 'Courses', icon: 'i-lucide-shopping-cart', hint: 'Supermarché, alimentation' },
  { key: 'restauration', label: 'Restauration', icon: 'i-lucide-utensils', hint: 'Restaurants, fast-food' },
  { key: 'assurances', label: 'Assurances', icon: 'i-lucide-shield', hint: 'Auto, habitation' },
  { key: 'mutuelle', label: 'Mutuelle', icon: 'i-lucide-heart-pulse', hint: 'Cotisation mutuelle santé' },
  { key: 'sante', label: 'Santé', icon: 'i-lucide-stethoscope', hint: 'Médecin, pharmacie, hôpital' },
  { key: 'credits', label: 'Crédits', icon: 'i-lucide-landmark', hint: 'Prêts, mensualités' },
  { key: 'transport', label: 'Transport', icon: 'i-lucide-car', hint: 'Carburant, péage, entretien' },
  { key: 'shopping', label: 'Shopping', icon: 'i-lucide-shopping-bag', hint: 'Vêtements, high-tech, divers' },
  { key: 'abonnements', label: 'Abonnements', icon: 'i-lucide-tv', hint: 'Streaming, SaaS, téléphone' },
  { key: 'loisirs', label: 'Loisirs', icon: 'i-lucide-gamepad-2', hint: 'Jeux, sport, sorties' },
  { key: 'epargne', label: 'Épargne', icon: 'i-lucide-piggy-bank', hint: 'Livrets, investissement' },
  { key: 'autres_depenses', label: 'Autres dépenses', icon: 'i-lucide-ellipsis', hint: 'Frais bancaires, divers' },
] as const

export type RevenueCategory = typeof REVENUE_CATEGORIES[number]['key']
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['key']
export type BudgetCategory = RevenueCategory | ExpenseCategory
export type BudgetType = 'revenu' | 'depense'

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const

export const MONTHS_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  salaire: '#5B7C5E',
  prime: '#6B8E6E',
  aides: '#7BA07E',
  autres_revenus: '#8BB28E',
  loyer: '#C45D4A',
  energie: '#D4943A',
  courses: '#5A7B9A',
  restauration: '#D97B4A',
  assurances: '#7B6E8E',
  mutuelle: '#9B5E7B',
  sante: '#E06070',
  credits: '#6B5B8E',
  transport: '#8E7B6E',
  shopping: '#5A8E9A',
  abonnements: '#6E8E8E',
  loisirs: '#9A7B5A',
  epargne: '#5B7C5E',
  autres_depenses: '#8E8E7B',
}
