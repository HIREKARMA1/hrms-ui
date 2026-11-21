import { eventTypeToScheduleCategory } from '../constants/officeCalendarScheduleCategoryColors'

import type { OfficeCalendarEvent } from '../types/officeCalendar'

import type { OfficeCalendarScheduleItem } from './officeCalendarScheduleItems'



/** Builds schedule sidebar rows from API upcoming/today event lists (one row per event). */

export function scheduleItemsFromOfficeEvents(events: OfficeCalendarEvent[]): OfficeCalendarScheduleItem[] {

  return events.map((event) => ({

    id: event.id,

    dateKey: event.startDate,

    category: eventTypeToScheduleCategory(event.type),

    title: event.title,

    startTime: event.startTime,

    endTime: event.endTime,

    allDay: event.allDay,

    organizerName: event.organizerName,

    isCompanyHoliday: false,

  }))

}
