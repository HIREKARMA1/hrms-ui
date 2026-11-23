/**
 * Query and data shapes for GET /calendar/view/monthly and daily.
 */
import type { ApiCalendarEventItem } from './calendarEventsList.types'

export type CalendarViewMonthlyQuery = {
  year: number
  month: number
  timezone?: string
}

export type CalendarViewDailyQuery = {
  date: string
  timezone?: string
}

export type CalendarMonthlyViewDay = {
  date: string
  events: ApiCalendarEventItem[]
  isWeeklyOff?: boolean
}

export type CalendarMonthlyViewData = {
  year: number
  month: number
  days: CalendarMonthlyViewDay[]
  truncated?: boolean
}

export type CalendarDailyViewData = {
  date: string
  allDayEvents: ApiCalendarEventItem[]
  timedEvents: ApiCalendarEventItem[]
  isWeeklyOff?: boolean
}