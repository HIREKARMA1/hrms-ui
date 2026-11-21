/** Body for POST /calendar/events (CalendarController_create). */

export type ApiCalendarEventType =

  | 'MEETING'

  | 'TRAINING'

  | 'WORKSHOP'

  | 'CELEBRATION'

  | 'ANNOUNCEMENT'

  | 'COMPANY_EVENT'

  | 'REMINDER'

  | 'OTHER'



export type ApiCalendarEventVisibility = 'PUBLIC' | 'PRIVATE' | 'DEPARTMENT'



export type CreateCalendarEventRequest = {

  title: string

  eventType: ApiCalendarEventType

  startAt: string

  endAt: string

  description?: string

  visibility?: ApiCalendarEventVisibility

  isAllDay?: boolean

  location?: string

  meetingLink?: string

  departmentId?: string

  organizerEmployeeId?: string

  attendeeEmployeeIds?: string[]

}

/** Body for PATCH /calendar/events/{id}. */
export type UpdateCalendarEventRequest = CreateCalendarEventRequest
