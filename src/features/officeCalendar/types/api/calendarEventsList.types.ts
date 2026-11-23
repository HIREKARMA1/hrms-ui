/** Query for `GET /calendar/events` (CalendarController_findAll). */

export type CalendarEventsListQuery = {

  year: number

  from: string

  to: string

  page?: number

  limit?: number

  sortBy?: 'startAt' | 'endAt' | 'title' | 'eventType' | 'createdAt'

  sortOrder?: 'asc' | 'desc'

}



export type ApiCalendarEventItem = {

  id: string

  title?: string

  name?: string

  type?: string

  eventType?: string

  category?: string

  startDate?: string

  endDate?: string

  startAt?: string

  endAt?: string

  startsAt?: string

  endsAt?: string

  startTime?: string

  endTime?: string

  allDay?: boolean

  isAllDay?: boolean

  visibility?: string

  isPublic?: boolean

  departmentId?: string | null

  branchId?: string | null

  organizerName?: string

  organizerEmployeeName?: string

  /** May be a plain string or nested employee/user object from the API. */
  organizer?: string | Record<string, unknown>

  createdByName?: string

  location?: string

  description?: string

}



export type CalendarEventsListData = {

  items: ApiCalendarEventItem[]

}
