import { createContext } from 'react'

import type {
  OfficeCalendarEvent,
  OfficeCalendarEventInput,
  OfficeHoliday,
  OfficeHolidayInput,
} from '../types/officeCalendar'

export type OfficeCalendarContextValue = {
  events: OfficeCalendarEvent[]
  holidays: OfficeHoliday[]
  loading: boolean
  error: string | null
  reload: () => void
  saveHoliday: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  removeHoliday: (id: string) => Promise<void>
  saveEvent: (input: OfficeCalendarEventInput, id?: string) => Promise<OfficeCalendarEvent>
  removeEvent: (id: string) => Promise<void>
}

export const OfficeCalendarContext = createContext<OfficeCalendarContextValue | null>(null)