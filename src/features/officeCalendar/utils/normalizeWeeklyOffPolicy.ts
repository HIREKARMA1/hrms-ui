/**
 * Normalizes GET /calendar/weekly-offs and POST response into WeeklyOffPolicy.
 */
import {
  WEEKLY_OFF_WEEKDAYS,
  type WeeklyOffPolicy,
  type WeeklyOffRule,
  type WeeklyOffWeekday,
} from '../types/api/weeklyOffs.types'

const WEEKDAY_SET = new Set<string>(WEEKLY_OFF_WEEKDAYS)

function normalizeWeekday(raw: unknown): WeeklyOffWeekday | null {
  if (typeof raw !== 'string') return null
  const upper = raw.trim().toUpperCase()
  return WEEKDAY_SET.has(upper) ? (upper as WeeklyOffWeekday) : null
}

function normalizeOccurrence(raw: unknown): number | null | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > 5) return undefined
  return n
}

export function normalizeWeeklyOffRule(raw: unknown): WeeklyOffRule | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  const weekday = normalizeWeekday(record.weekday ?? record.day ?? record.dayOfWeek)
  if (!weekday) return null
  const occurrence = normalizeOccurrence(record.occurrence ?? record.weekOfMonth)
  return occurrence === undefined ? { weekday } : { weekday, occurrence }
}

function rulesArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'rules' in raw) {
    const rules = (raw as { rules: unknown }).rules
    return Array.isArray(rules) ? rules : []
  }
  if (raw && typeof raw === 'object' && 'policy' in raw) {
    return rulesArray((raw as { policy: unknown }).policy)
  }
  return []
}

export function normalizeWeeklyOffPolicy(raw: unknown): WeeklyOffPolicy {
  const body =
    raw && typeof raw === 'object' && 'policy' in raw
      ? (raw as { policy: unknown }).policy
      : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const rules = rulesArray(body ?? raw)
    .map(normalizeWeeklyOffRule)
    .filter((rule): rule is WeeklyOffRule => rule !== null)
  return {
    rules,
    timezone: typeof root.timezone === 'string' ? root.timezone : undefined,
    updatedAt: typeof root.updatedAt === 'string' ? root.updatedAt : undefined,
  }
}