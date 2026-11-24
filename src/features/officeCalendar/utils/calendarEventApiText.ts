import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'

const ORGANIZER_OBJECT_NAME_KEYS = [
  'name',
  'fullName',
  'displayName',
  'organizerName',
  'employeeName',
  'createdByName',
] as const

/** Coerce API scalar values to a trimmed non-empty string, or undefined. */
export function coerceOptionalApiString(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const trimmed = String(value).trim()
    return trimmed || undefined
  }
  return undefined
}

export function coerceApiStringWithFallback(value: unknown, fallback: string): string {
  return coerceOptionalApiString(value) ?? fallback
}

function nameFromOrganizerObject(value: Record<string, unknown>): string | undefined {
  for (const key of ORGANIZER_OBJECT_NAME_KEYS) {
    const text = coerceOptionalApiString(value[key])
    if (text) return text
  }
  const first = coerceOptionalApiString(value.firstName)
  const last = coerceOptionalApiString(value.lastName)
  const combined = [first, last].filter(Boolean).join(' ').trim()
  return combined || undefined
}

/** Resolve organizer display name from heterogeneous API event payloads. */
export function resolveCalendarEventOrganizerName(item: ApiCalendarEventItem): string {
  const candidates: unknown[] = [
    item.organizerName,
    item.organizerEmployeeName,
    item.organizer,
    item.createdByName,
  ]

  for (const candidate of candidates) {
    if (candidate != null && typeof candidate === 'object') {
      const fromObject = nameFromOrganizerObject(candidate as Record<string, unknown>)
      if (fromObject) return fromObject
      continue
    }
    const text = coerceOptionalApiString(candidate)
    if (text) return text
  }

  return 'Organizer'
}