import type { OfficeEventType, OfficeEventVisibility } from '../types/officeCalendar'



/** Maps API calendar event type → office calendar UI type. */

export function mapApiCalendarEventTypeToOffice(raw?: string): OfficeEventType {

  const value = (raw ?? '').trim().toUpperCase()

  if (value === 'MEETING') return 'meeting'

  if (value === 'TRAINING' || value === 'WORKSHOP') return 'training'

  if (value === 'HOLIDAY') return 'holiday'

  if (

    value === 'CELEBRATION' ||

    value === 'COMPANY_EVENT' ||

    value === 'ANNOUNCEMENT' ||

    value === 'REMINDER' ||

    value === 'OTHER' ||

    value === 'EVENT'

  ) {

    return 'event'

  }

  return 'event'

}



export function mapApiCalendarVisibilityToOffice(

  visibility?: string,

  isPublic?: boolean,

): OfficeEventVisibility {

  if (typeof isPublic === 'boolean') {

    return isPublic ? 'public' : 'private'

  }

  const value = (visibility ?? '').trim().toUpperCase()

  if (value === 'PRIVATE') return 'private'

  if (value === 'DEPARTMENT') return 'public'

  if (value === 'PUBLIC') return 'public'

  return 'public'

}
