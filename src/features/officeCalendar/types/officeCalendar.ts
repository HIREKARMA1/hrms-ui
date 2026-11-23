export type OfficeEventType = 'holiday' | 'event' | 'meeting' | 'training'

export type OfficeEventVisibility = 'public' | 'private'

export type OfficeCalendarEvent = {
  id: string
  title: string
  type: OfficeEventType
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  allDay: boolean
  visibility: OfficeEventVisibility
  departmentId: string | null
  branchId: string | null
  organizerName: string
  description: string
}

export type OfficeHolidayType =
  | 'National'
  | 'State'
  | 'Regional'
  | 'Festival'
  | 'Company'
  | 'Optional'

export type OfficeHoliday = {
  id: string
  name: string
  date: string
  type: OfficeHolidayType
  state?: string
  departmentId: string | null
  branchId: string | null
  mandatory: boolean
  description: string
}

export type OfficeHolidayInput = Omit<OfficeHoliday, 'id'>

export type OfficeCalendarEventInput = Omit<OfficeCalendarEvent, 'id'>

export type OfficeEventFormType = Exclude<OfficeEventType, 'holiday'>