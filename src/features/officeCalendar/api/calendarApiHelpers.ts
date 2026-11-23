/**
 * Shared helpers for calendar RTK endpoints (detail unwrap, tag years).
 */
import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'

export const CALENDAR_EVENT_READ_INVALIDATIONS = [{ type: 'CalendarEvent' as const }]

export function normalizeCalendarEventDetail(raw: unknown): ApiCalendarEventItem {
  if (raw && typeof raw === 'object' && 'event' in raw) {
    return (raw as { event: ApiCalendarEventItem }).event
  }
  if (raw && typeof raw === 'object' && 'item' in raw) {
    return (raw as { item: ApiCalendarEventItem }).item
  }
  return raw as ApiCalendarEventItem
}

export function listYearFromIso(iso: string): number {
  return Number(iso.slice(0, 4)) || new Date().getFullYear()
}