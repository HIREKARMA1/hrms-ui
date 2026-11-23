import type { ApiCalendarEventItem, CalendarEventsListData } from '../types/api/calendarEventsList.types'



export function normalizeCalendarEventsList(raw: unknown): CalendarEventsListData {

  if (Array.isArray(raw)) {

    return { items: raw as ApiCalendarEventItem[] }

  }

  if (raw && typeof raw === 'object' && 'items' in raw) {

    const items = (raw as { items: unknown }).items

    return { items: Array.isArray(items) ? (items as ApiCalendarEventItem[]) : [] }

  }

  if (raw && typeof raw === 'object' && 'events' in raw) {

    const events = (raw as { events: ApiCalendarEventItem[] }).events

    return { items: Array.isArray(events) ? events : [] }

  }

  if (raw && typeof raw === 'object' && 'data' in raw) {

    return normalizeCalendarEventsList((raw as { data: unknown }).data)

  }

  return { items: [] }

}



export function normalizeCalendarWidgetUpcoming(raw: unknown): { items: ApiCalendarEventItem[]; total?: number } {

  if (raw && typeof raw === 'object' && 'items' in raw) {

    const body = raw as { items: unknown; total?: number }

    const items = Array.isArray(body.items) ? (body.items as ApiCalendarEventItem[]) : []

    return { items, total: typeof body.total === 'number' ? body.total : undefined }

  }

  const list = normalizeCalendarEventsList(raw)

  return { items: list.items }

}
