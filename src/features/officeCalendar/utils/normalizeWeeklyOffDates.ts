/**
 * Normalizes GET /calendar/weekly-offs/dates into WeeklyOffDatesData.
 */
import type { WeeklyOffDatesData } from '../types/api/weeklyOffs.types'

function dateStrings(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item.slice(0, 10)
        if (item && typeof item === 'object' && 'date' in item) {
          return String((item as { date: unknown }).date).slice(0, 10)
        }
        return ''
      })
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  }
  return []
}

export function normalizeWeeklyOffDates(raw: unknown): WeeklyOffDatesData {
  const body =
    raw && typeof raw === 'object' && 'dates' in raw
      ? raw
      : raw && typeof raw === 'object' && 'data' in raw
        ? (raw as { data: unknown }).data
        : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const listRaw = root.dates ?? root.items ?? root.offDates ?? body
  const year = Number(root.year ?? new Date().getFullYear())
  const monthRaw = root.month
  const month =
    monthRaw === null || monthRaw === undefined || monthRaw === ''
      ? undefined
      : Number(monthRaw)
  return {
    year,
    month: month !== undefined && Number.isFinite(month) ? month : undefined,
    dates: dateStrings(listRaw),
    timezone: typeof root.timezone === 'string' ? root.timezone : undefined,
  }
}