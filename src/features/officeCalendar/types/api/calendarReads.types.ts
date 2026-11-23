import type { ApiCalendarEventItem } from './calendarEventsList.types'



export type CalendarUpcomingQuery = {

  days?: number

  limit?: number

  page?: number

}



export type CalendarTodayQuery = {

  date?: string

  timezone?: string

}



export type CalendarWidgetUpcomingQuery = {

  days?: number

  limit?: number

}



export type CalendarSearchQuery = {

  q: string

  from: string

  to: string

  page?: number

  limit?: number

}



export type CalendarWidgetUpcomingData = {

  items: ApiCalendarEventItem[]

  total?: number

}
