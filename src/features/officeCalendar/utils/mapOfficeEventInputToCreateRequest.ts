import type { OfficeCalendarEventInput } from '../types/officeCalendar'



import type {

  ApiCalendarEventVisibility,

  CreateCalendarEventRequest,

} from '../types/api/calendarEventCreate.types'

import { buildOfficeCalendarEventAt } from './buildOfficeCalendarEventAt'

import { mapOfficeEventTypeToApi } from './mapOfficeEventTypeToApi'



type MapOfficeEventCreateContext = {

  organizerEmployeeId?: string | null

}



function mapOfficeVisibilityToApi(visibility: OfficeCalendarEventInput['visibility']): ApiCalendarEventVisibility {

  return visibility === 'public' ? 'PUBLIC' : 'PRIVATE'

}



/** Maps office calendar form values → POST /calendar/events body. */

export function mapOfficeEventInputToCreateRequest(

  input: OfficeCalendarEventInput,

  context?: MapOfficeEventCreateContext,

): CreateCalendarEventRequest {

  const formType = input.type === 'holiday' ? 'event' : input.type

  const startDate = input.startDate.slice(0, 10)

  const endDate = input.endDate.slice(0, 10)



  const body: CreateCalendarEventRequest = {

    title: input.title.trim(),

    eventType: mapOfficeEventTypeToApi(formType),

    startAt: buildOfficeCalendarEventAt(startDate, input.startTime, input.allDay, 'start'),

    endAt: buildOfficeCalendarEventAt(

      endDate,

      input.endTime ?? input.startTime,

      input.allDay,

      'end',

    ),

    visibility: mapOfficeVisibilityToApi(input.visibility),

    isAllDay: input.allDay,

  }



  const description = input.description.trim()

  if (description) {

    body.description = description

  }



  if (input.departmentId) {

    body.departmentId = input.departmentId

  }



  const organizerEmployeeId = context?.organizerEmployeeId?.trim()

  if (organizerEmployeeId) {

    body.organizerEmployeeId = organizerEmployeeId

  }



  return body

}
