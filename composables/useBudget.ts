import type { BudgetType, BudgetCategory } from '~/shared/constants'

export interface BudgetEntry {
  id: number
  userId: string
  userName: string
  year: number
  month: number
  type: BudgetType
  category: BudgetCategory
  label: string | null
  amount: number
}

export interface MonthData {
  entries: BudgetEntry[]
  totalRevenus: number
  totalDepenses: number
  solde: number
}

export interface CategoryEvolution {
  months: Array<{ year: number; month: number; label: string }>
  categories: Array<{ key: string; label: string; color: string; data: number[] }>
}

export interface AnnualSummary {
  months: Array<{
    month: number
    totalRevenus: number
    totalDepenses: number
    solde: number
  }>
  totalRevenus: number
  totalDepenses: number
  solde: number
  moyenneMensuelle: number
}

export function useBudget() {
  const currentYear = useState('budget-year', () => new Date().getFullYear())
  const currentMonth = useState('budget-month', () => new Date().getMonth())
  const monthData = useState<MonthData>('budget-month-data', () => ({
    entries: [],
    totalRevenus: 0,
    totalDepenses: 0,
    solde: 0,
  }))
  const annualData = useState<AnnualSummary | null>('budget-annual-data', () => null)
  const categoryEvolution = useState<CategoryEvolution | null>('budget-category-evolution', () => null)
  const saving = useState('budget-saving', () => false)
  const loadingMonth = useState('budget-loading-month', () => false)

  async function fetchMonth(year?: number, month?: number) {
    const y = year ?? currentYear.value
    const m = month ?? currentMonth.value
    loadingMonth.value = true
    try {
      const data = await $fetch<MonthData>(`/api/budget/${y}/${m}`)
      monthData.value = data
    } catch (err) {
      console.error('Erreur chargement mois:', err)
    } finally {
      loadingMonth.value = false
    }
  }

  function recalcTotals() {
    const entries = monthData.value.entries
    monthData.value.totalRevenus = entries.filter(e => e.type === 'revenu').reduce((s, e) => s + e.amount, 0)
    monthData.value.totalDepenses = entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.amount, 0)
    monthData.value.solde = monthData.value.totalRevenus - monthData.value.totalDepenses
  }

  async function addEntry(type: BudgetType, category: string, amount: number, label?: string) {
    saving.value = true
    try {
      const saved = await $fetch<BudgetEntry>(`/api/budget/${currentYear.value}/${currentMonth.value}`, {
        method: 'POST',
        body: { type, category, amount, label },
      })
      monthData.value.entries.push(saved)
      recalcTotals()
    } catch (err) {
      console.error('Erreur ajout:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateEntry(entryId: number, fields: { amount?: number; label?: string }) {
    const idx = monthData.value.entries.findIndex(e => e.id === entryId)
    if (idx === -1) return
    const backup = { ...monthData.value.entries[idx] }
    if (fields.amount !== undefined) monthData.value.entries[idx].amount = fields.amount
    if (fields.label !== undefined) monthData.value.entries[idx].label = fields.label
    recalcTotals()
    try {
      await $fetch(`/api/budget/${currentYear.value}/${currentMonth.value}/${entryId}`, {
        method: 'PATCH',
        body: fields,
      })
    } catch (err) {
      console.error('Erreur modification:', err)
      monthData.value.entries[idx] = backup
      recalcTotals()
      throw err
    }
  }

  async function deleteEntry(entryId: number) {
    const backup = monthData.value.entries.slice()
    monthData.value.entries = monthData.value.entries.filter(e => e.id !== entryId)
    recalcTotals()
    try {
      await $fetch(`/api/budget/${currentYear.value}/${currentMonth.value}/${entryId}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Erreur suppression:', err)
      monthData.value.entries = backup
      recalcTotals()
      throw err
    }
  }

  async function copyPrevious() {
    try {
      await $fetch(`/api/budget/${currentYear.value}/${currentMonth.value}/copy-previous`, {
        method: 'POST',
      })
      await fetchMonth()
    } catch (err) {
      console.error('Erreur copie:', err)
      throw err
    }
  }

  async function applyRecurring(): Promise<{ applied: number; skipped: number }> {
    const result = await $fetch<{ applied: number; skipped: number; total: number }>(
      `/api/budget/${currentYear.value}/${currentMonth.value}/apply-recurring`,
      { method: 'POST' },
    )
    await fetchMonth()
    return result
  }

  async function fetchCategoryEvolution(year?: number, month?: number) {
    const y = year ?? currentYear.value
    const m = month ?? currentMonth.value
    try {
      const data = await $fetch<CategoryEvolution>(`/api/budget/${y}/${m}/category-evolution`)
      categoryEvolution.value = data
    } catch (err) {
      console.error('Erreur chargement évolution catégories:', err)
    }
  }

  async function fetchAnnual(year?: number) {
    const y = year ?? currentYear.value
    try {
      const data = await $fetch<AnnualSummary>(`/api/budget/${y}/summary`)
      annualData.value = data
    } catch (err) {
      console.error('Erreur chargement annuel:', err)
    }
  }

  function setMonth(month: number) {
    currentMonth.value = month
    fetchMonth()
  }

  function setYear(year: number) {
    currentYear.value = year
    fetchMonth()
  }

  return {
    currentYear,
    currentMonth,
    monthData,
    annualData,
    categoryEvolution,
    saving,
    loadingMonth,
    fetchMonth,
    addEntry,
    updateEntry,
    deleteEntry,
    copyPrevious,
    applyRecurring,
    fetchAnnual,
    fetchCategoryEvolution,
    setMonth,
    setYear,
  }
}
