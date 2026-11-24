export function formatEmploymentType(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join('-')
}

export function formatWorkMode(value: string) {
  if (value === 'ONSITE') return 'On-site'
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function formatExperience(min: number | null, max: number | null): string {
  if (min === null && max === null) return '—'
  if (min !== null && max !== null) return `${min}–${max} yrs`
  if (min !== null) return `${min}+ yrs`
  return `Up to ${max} yrs`
}

export function formatPostedDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

export function formatJobStatusLabel(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
