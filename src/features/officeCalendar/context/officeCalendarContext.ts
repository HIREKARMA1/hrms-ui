import { createContext } from 'react'

import type {
  OfficeCalendarEvent,
  OfficeCalendarEventInput,
  OfficeHoliday,
  OfficeHolidayInput,
} from '../types/officeCalendar'

export type OfficeHolidayListSource = 'api' | 'demo'

export type OfficeCalendarEventListSource = 'api' | 'demo'

export type OfficeCalendarContextValue = {
  events: OfficeCalendarEvent[]
  holidays: OfficeHoliday[]
  /** Selected year for GET /holidays when using the live list. */
  holidayYear: number
  setHolidayYear: (year: number) => void
  holidaysSource: OfficeHolidayListSource
  holidaysFetching: boolean
  /** Selected year for GET /calendar when using the live events list. */
  eventYear: number
  setEventYear: (year: number) => void
  eventsSource: OfficeCalendarEventListSource
  eventsFetching: boolean
  eventSearchQuery: string
  setEventSearchQuery: (query: string) => void
  eventSearchFetching: boolean
  loading: boolean
  error: string | null
  reload: () => void
  saveHoliday: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  removeHoliday: (id: string) => Promise<void>
  saveEvent: (input: OfficeCalendarEventInput, id?: string) => Promise<OfficeCalendarEvent>
  removeEvent: (id: string) => Promise<void>
}

export const OfficeCalendarContext = createContext<OfficeCalendarContextValue | null>(null)