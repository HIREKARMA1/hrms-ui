import type { OfficeCalendarEvent } from '../types/officeCalendar'
import type { ApiCalendarEventItem } from '../types/api/calendarEventsList.types'

import {
  mapApiCalendarEventTypeToOffice,
  mapApiCalendarVisibilityToOffice,
} from './calendarEventTypeApiMap'
import {
  coerceApiStringWithFallback,
  coerceOptionalApiString,
  resolveCalendarEventOrganizerName,
} from './calendarEventApiText'

function sliceDate(value: unknown): string {
  const text = coerceOptionalApiString(value)
  return text ? text.slice(0, 10) : ''
}

function sliceTime(value: unknown): string | undefined {
  const text = coerceOptionalApiString(value)
  if (!text || !text.includes('T')) return undefined
  const part = text.slice(11, 16)
  return /^\d{2}:\d{2}$/.test(part) ? part : undefined
}

function resolveDateField(item: ApiCalendarEventItem, kind: 'start' | 'end'): string {
  if (kind === 'start') {
    return sliceDate(
      item.startDate ?? item.startAt ?? item.startsAt ?? item.startTime,
    )
  }
  return sliceDate(item.endDate ?? item.endAt ?? item.endsAt ?? item.endTime)
}

function resolveTimeField(item: ApiCalendarEventItem, kind: 'start' | 'end'): string | undefined {
  const inline = kind === 'start' ? item.startTime : item.endTime
  const inlineText = coerceOptionalApiString(inline)
  if (inlineText && /^\d{2}:\d{2}/.test(inlineText)) {
    return inlineText.slice(0, 5)
  }
  const iso = kind === 'start' ? item.startAt ?? item.startsAt : item.endAt ?? item.endsAt
  return sliceTime(iso)
}

/** Maps GET /calendar/events list item → office calendar event. */
export function mapApiCalendarEventToOfficeEvent(item: ApiCalendarEventItem): OfficeCalendarEvent {
  const startDate = resolveDateField(item, 'start')
  const endDate = resolveDateField(item, 'end') || startDate
  const allDay = item.isAllDay ?? item.allDay ?? false

  return {
    id: item.id,
    title: coerceApiStringWithFallback(item.title ?? item.name, 'Event'),
    type: mapApiCalendarEventTypeToOffice(item.type ?? item.eventType ?? item.category),
    startDate,
    endDate,
    startTime: allDay ? undefined : resolveTimeField(item, 'start'),
    endTime: allDay ? undefined : resolveTimeField(item, 'end'),
    allDay,
    visibility: mapApiCalendarVisibilityToOffice(item.visibility, item.isPublic),
    departmentId: item.departmentId ?? null,
    branchId: item.branchId ?? null,
    organizerName: resolveCalendarEventOrganizerName(item),
    description: coerceOptionalApiString(item.description) ?? '',
  }
}

export function mapApiCalendarEventsListToOfficeEvents(
  items: ApiCalendarEventItem[],
): OfficeCalendarEvent[] {
  return items
    .map(mapApiCalendarEventToOfficeEvent)
    .filter((item) => item.id && item.title && item.startDate)
}