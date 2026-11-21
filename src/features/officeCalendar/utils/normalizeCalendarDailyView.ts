/**
 * Normalizes GET /calendar/view/daily envelope into all-day and timed lists.
 */
import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'
import type { CalendarDailyViewData } from '../types/api/calendarViews.types'
import { readIsWeeklyOffDay } from './normalizeWeeklyOffDayFlag'

function asEventList(value: unknown): ApiCalendarEventItem[] {
  return Array.isArray(value) ? (value as ApiCalendarEventItem[]) : []
}

export function normalizeCalendarDailyView(raw: unknown): CalendarDailyViewData {
  const body =
    raw && typeof raw === 'object' && 'view' in raw
      ? (raw as { view: unknown }).view
      : raw && typeof raw === 'object' && 'data' in raw
        ? (raw as { data: unknown }).data
        : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const date = String(root.date ?? root.dateKey ?? '').slice(0, 10)
  return {
    date,
    allDayEvents: asEventList(root.allDayEvents ?? root.allDay),
    timedEvents: asEventList(root.timedEvents ?? root.timed ?? root.events),
    isWeeklyOff: readIsWeeklyOffDay(root),
  }
}