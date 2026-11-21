import type { OfficeEventFormType } from '../types/officeCalendar'

import type { ApiCalendarEventType } from '../types/api/calendarEventCreate.types'



/** Maps office calendar form type → POST /calendar/events `eventType`. */

export function mapOfficeEventTypeToApi(type: OfficeEventFormType): ApiCalendarEventType {

  if (type === 'meeting') return 'MEETING'

  if (type === 'training') return 'TRAINING'

  return 'OTHER'

}
