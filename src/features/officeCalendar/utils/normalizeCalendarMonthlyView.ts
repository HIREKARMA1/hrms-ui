/**
 * Normalizes GET /calendar/view/monthly envelope into typed month + days.
 */
import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'
import type { CalendarMonthlyViewData, CalendarMonthlyViewDay } from '../types/api/calendarViews.types'
import { readIsWeeklyOffDay } from './normalizeWeeklyOffDayFlag'

function dayEvents(day: Record<string, unknown>): ApiCalendarEventItem[] {
  const raw = day.events ?? day.items
  return Array.isArray(raw) ? (raw as ApiCalendarEventItem[]) : []
}

function dayDate(day: Record<string, unknown>): string {
  return String(day.date ?? day.dateKey ?? day.day ?? '').slice(0, 10)
}

function normalizeDay(day: unknown): CalendarMonthlyViewDay | null {
  if (!day || typeof day !== 'object') return null
  const record = day as Record<string, unknown>
  const date = dayDate(record)
  if (!date) return null
  return {
    date,
    events: dayEvents(record),
    isWeeklyOff: readIsWeeklyOffDay(record),
  }
}

export function normalizeCalendarMonthlyView(raw: unknown): CalendarMonthlyViewData {
  const body =
    raw && typeof raw === 'object' && 'view' in raw
      ? (raw as { view: unknown }).view
      : raw && typeof raw === 'object' && 'data' in raw
        ? (raw as { data: unknown }).data
        : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const year = Number(root.year ?? root.monthYear ?? new Date().getFullYear())
  const month = Number(root.month ?? root.monthNumber ?? new Date().getMonth() + 1)
  const daysRaw = root.days ?? root.dates
  const days = Array.isArray(daysRaw)
    ? daysRaw.map(normalizeDay).filter((d): d is CalendarMonthlyViewDay => d !== null)
    : []
  return {
    year,
    month,
    days,
    truncated: root.truncated === true,
  }
}