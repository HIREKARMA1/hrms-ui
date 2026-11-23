import type {
  OfficeCalendarEvent,
  OfficeCalendarEventInput,
  OfficeEventFormType,
} from '../types/officeCalendar'

export function emptyOfficeEventInput(defaultStartDate?: string): OfficeCalendarEventInput {
  const date = defaultStartDate ?? ''
  return {
    title: '',
    type: 'event',
    startDate: date,
    endDate: date,
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    visibility: 'public',
    departmentId: null,
    branchId: null,
    organizerName: 'HR Admin',
    description: '',
  }
}

export function officeEventInputFromEvent(event: OfficeCalendarEvent): OfficeCalendarEventInput {
  return {
    title: event.title,
    type: event.type === 'holiday' ? 'event' : (event.type as OfficeEventFormType),
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    allDay: event.allDay,
    visibility: event.visibility,
    departmentId: event.departmentId,
    branchId: event.branchId,
    organizerName: event.organizerName,
    description: event.description,
  }
}