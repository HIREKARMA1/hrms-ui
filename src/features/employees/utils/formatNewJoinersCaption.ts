import type { NewJoinersData } from '../api/employeeDashboardApi.types'
import { formatDashboardDate } from './dashboardDateRange'

export function currentMonthInputValue(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function parseMonthInputValue(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

export function formatNewJoinersSubtitle(data: NewJoinersData | undefined): string {
  if (!data) return 'Employees who joined in the selected month'
  const from = formatDashboardDate(data.periodStart)
  const to = formatDashboardDate(data.periodEnd)
  const tz = data.timezone?.trim() ? ` · ${data.timezone}` : ''
  const total = data.pagination?.total ?? data.items.length
  return `${from} – ${to}${tz} · ${total} new joiner${total === 1 ? '' : 's'}`
}

export function formatEmploymentStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}