export function useFormatters() {
  function formatEuro(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  function formatPercent(value: number): string {
    if (!isFinite(value)) return '—'
    return `${Math.round(value)}%`
  }

  function formatCompact(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k €`
    }
    return `${Math.round(amount)} €`
  }

  return {
    formatEuro,
    formatPercent,
    formatCompact,
  }
}
