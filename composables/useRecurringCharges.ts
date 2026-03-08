import type { BudgetType, BudgetCategory } from '~/shared/constants'

export interface RecurringCharge {
  id: number
  userId: string
  type: BudgetType
  category: BudgetCategory
  label: string | null
  amount: number
  isActive: boolean
}

export function useRecurringCharges() {
  const charges = useState<RecurringCharge[]>('recurring-charges', () => [])
  const loading = useState('recurring-loading', () => false)
  const saving = useState('recurring-saving', () => false)

  async function fetchCharges() {
    loading.value = true
    try {
      charges.value = await $fetch<RecurringCharge[]>('/api/recurring')
    } catch (err) {
      console.error('Erreur chargement charges récurrentes:', err)
    } finally {
      loading.value = false
    }
  }

  async function addCharge(data: { type: BudgetType; category: string; amount: number; label?: string }) {
    saving.value = true
    try {
      const created = await $fetch<RecurringCharge>('/api/recurring', {
        method: 'POST',
        body: data,
      })
      charges.value.push(created)
    } catch (err) {
      console.error('Erreur ajout charge récurrente:', err)
      throw err
    } finally {
      saving.value = false
    }
  }

  async function updateCharge(id: number, fields: { amount?: number; label?: string; isActive?: boolean }) {
    const idx = charges.value.findIndex(c => c.id === id)
    if (idx === -1) return

    const backup = { ...charges.value[idx]! }
    charges.value[idx] = { ...backup, ...fields }

    try {
      await $fetch(`/api/recurring/${id}`, {
        method: 'PATCH',
        body: fields,
      })
    } catch (err) {
      console.error('Erreur modification charge récurrente:', err)
      charges.value[idx] = backup
      throw err
    }
  }

  async function toggleCharge(id: number) {
    const charge = charges.value.find(c => c.id === id)
    if (!charge) return
    await updateCharge(id, { isActive: !charge.isActive })
  }

  async function deleteCharge(id: number) {
    const backup = charges.value.slice()
    charges.value = charges.value.filter(c => c.id !== id)

    try {
      await $fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Erreur suppression charge récurrente:', err)
      charges.value = backup
      throw err
    }
  }

  return { charges, loading, saving, fetchCharges, addCharge, updateCharge, toggleCharge, deleteCharge }
}
