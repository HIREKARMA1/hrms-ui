import { toDateOnly } from '../api/leaveMappers'

import { formatDate } from './formatDate'

export function formatPolicySingleDate(value: string | null | undefined): string {
  const date = value ? toDateOnly(value) : null
  return date ? formatDate(date) : '—'
}

function dayMonthYearParts(iso: string): [string, string, string] | null {
  const label = formatPolicySingleDate(iso)
  if (label === '—') return null
  const parts = label.split(' ')
  if (parts.length !== 3) return null
  return [parts[0], parts[1], parts[2]]
}

/** Compact effective range for policy tables (same month/year → `25–27 Nov 2026`). */
export function formatPolicyEffectiveRange(
  from: string | null | undefined,
  to?: string | null | undefined,
): string {
  if (!from?.trim()) return '—'
  const fromParts = dayMonthYearParts(from)
  if (!fromParts) return formatPolicySingleDate(from)
  const [, month, year] = fromParts

  if (!to?.trim()) {
    return `${fromParts[0]} ${month} ${year} – open`
  }

  const toParts = dayMonthYearParts(to)
  if (!toParts) {
    return `${formatPolicySingleDate(from)} – ${formatPolicySingleDate(to)}`
  }

  if (month === toParts[1] && year === toParts[2]) {
    return `${fromParts[0]}–${toParts[0]} ${month} ${year}`
  }

  return `${fromParts[0]} ${month} – ${toParts[0]} ${toParts[1]} ${toParts[2]}`
}

export function formatExpiryMonths(months: number | null): string {
  if (months === null) return 'Never'
  return months === 1 ? '1 month' : `${months} months`
}