export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-IN')
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString('en-IN')
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString('en-IN')
}

export function formatNumber(value: number) {
  return value.toLocaleString('en-IN')
}

export function formatCurrencyInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}