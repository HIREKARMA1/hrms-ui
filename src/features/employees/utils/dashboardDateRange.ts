import type { DateRangePreset } from '../types/employeeDashboard.types'

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfWeek(date: Date): Date {
  const next = new Date(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  next.setHours(0, 0, 0, 0)
  return next
}

/** Inclusive YYYY-MM-DD range for dashboard analytics period presets. */
export function dashboardPeriodRange(
  period: Exclude<DateRangePreset, 'custom'>,
  now = new Date(),
): { startDate: string; endDate: string } {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (period === 'this-week') {
    return { startDate: toIsoDate(startOfWeek(today)), endDate: toIsoDate(today) }
  }

  if (period === 'last-month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
  }

  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  return { startDate: toIsoDate(start), endDate: toIsoDate(today) }
}

/** Short display date, e.g. `12 Nov`. */
export function formatDashboardDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Chart x-axis label from YYYY-MM-DD. */
export function formatDashboardAxisLabel(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export const DEPARTMENT_CHART_COLORS = [
  '#0F766E',
  '#16A34A',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
  '#EC4899',
  '#64748B',
  '#0EA5E9',
]

export const LEAVE_TYPE_CHART_COLORS = [
  '#0F766E',
  '#16A34A',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
]
