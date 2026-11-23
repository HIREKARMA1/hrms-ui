export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatOfficeDate(isoDate: string, options?: Intl.DateTimeFormatOptions): string {
  const parsed = new Date(`${isoDate}T12:00:00`)
  return parsed.toLocaleDateString(undefined, options ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}