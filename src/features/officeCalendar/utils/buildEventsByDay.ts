import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

export type DayMarker = {
  holidays: OfficeHoliday[]
  events: OfficeCalendarEvent[]
}

export function buildEventsByDay(
  holidays: OfficeHoliday[],
  events: OfficeCalendarEvent[],
): Record<string, DayMarker> {
  const map: Record<string, DayMarker> = {}

  function ensure(date: string) {
    if (!map[date]) {
      map[date] = { holidays: [], events: [] }
    }
    return map[date]
  }

  for (const holiday of holidays) {
    ensure(holiday.date).holidays.push(holiday)
  }

  for (const event of events) {
    const start = new Date(`${event.startDate}T12:00:00`)
    const end = new Date(`${event.endDate}T12:00:00`)
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const key = cursor.toISOString().slice(0, 10)
      ensure(key).events.push(event)
    }
  }

  return map
}