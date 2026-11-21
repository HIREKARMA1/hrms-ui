/**
 * Maps calendar view API payloads → schedule grid rows and office events.
 */
import { eventTypeToScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'
import type {
  CalendarDailyViewData,
  CalendarMonthlyViewData,
} from '../types/api/calendarViews.types'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'
import { mapApiCalendarEventToOfficeEvent } from './mapApiCalendarEventToOfficeEvent'
import type { OfficeCalendarScheduleItem } from './officeCalendarScheduleItems'
import { monthPrefix } from './officeCalendarScheduleItems'

export function weeklyOffScheduleItem(dateKey: string): OfficeCalendarScheduleItem {
  return {
    id: `weekly-off-${dateKey}`,
    dateKey,
    category: 'weeklyOff',
    title: 'Weekly off',
    allDay: true,
    organizerName: '',
    isCompanyHoliday: false,
  }
}

export function officeEventsFromMonthlyView(data: CalendarMonthlyViewData): OfficeCalendarEvent[] {
  const byId = new Map<string, OfficeCalendarEvent>()
  for (const day of data.days) {
    for (const raw of day.events) {
      if (!raw.id || byId.has(raw.id)) continue
      byId.set(raw.id, mapApiCalendarEventToOfficeEvent(raw))
    }
  }
  return [...byId.values()]
}

export function monthlyViewToScheduleItems(
  holidays: OfficeHoliday[],
  data: CalendarMonthlyViewData,
  month: Date,
): OfficeCalendarScheduleItem[] {
  const prefix = monthPrefix(month)
  const rows: OfficeCalendarScheduleItem[] = holidays
    .filter((item) => item.date.startsWith(prefix))
    .map((item) => ({
      id: `holiday-${item.id}`,
      dateKey: item.date,
      category: 'holiday',
      title: item.name,
      allDay: true,
      organizerName: '',
      isCompanyHoliday: true,
    }))
  for (const day of data.days) {
    if (day.isWeeklyOff) {
      rows.push(weeklyOffScheduleItem(day.date))
    }
    for (const raw of day.events) {
      const event = mapApiCalendarEventToOfficeEvent(raw)
      rows.push({
        id: `${event.id}-${day.date}`,
        dateKey: day.date,
        category: eventTypeToScheduleCategory(event.type),
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        organizerName: event.organizerName,
        isCompanyHoliday: false,
      })
    }
  }
  return rows
}

export function dailyViewToAgendaItems(
  data: CalendarDailyViewData,
  dateKey: string,
  visible: (category: OfficeCalendarScheduleItem['category']) => boolean,
): OfficeCalendarScheduleItem[] {
  const combined = [...data.allDayEvents, ...data.timedEvents]
  const rows: OfficeCalendarScheduleItem[] = []
  for (const raw of combined) {
    const event = mapApiCalendarEventToOfficeEvent(raw)
    const category = eventTypeToScheduleCategory(event.type)
    if (!visible(category)) continue
    rows.push({
      id: event.id,
      dateKey,
      category,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      organizerName: event.organizerName,
      isCompanyHoliday: false,
    })
  }
  return rows
}