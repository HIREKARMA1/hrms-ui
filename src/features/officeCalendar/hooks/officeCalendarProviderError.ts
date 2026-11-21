/**
 * Merges demo vs API errors for Office Calendar provider.
 */
import { getApiErrorMessage } from '@/services/api/errors'

type OfficeCalendarProviderErrorInput = {
  shouldFetchCalendarEvents: boolean
  shouldFetchHolidays: boolean
  eventsIsError: boolean
  eventsError: unknown
  demoEventsError: string | null
  holidaysIsError: boolean
  holidaysError: unknown
  demoHolidaysError: string | null
}

export function resolveOfficeCalendarProviderError(input: OfficeCalendarProviderErrorInput): string | null {
  if (input.shouldFetchCalendarEvents && input.eventsIsError) {
    return getApiErrorMessage(input.eventsError, 'Unable to load calendar events from the server.')
  }
  if (!input.shouldFetchCalendarEvents && input.demoEventsError) return input.demoEventsError
  if (input.shouldFetchHolidays && input.holidaysIsError) {
    return getApiErrorMessage(input.holidaysError, 'Unable to load holidays from the server.')
  }
  if (!input.shouldFetchHolidays && input.demoHolidaysError) return input.demoHolidaysError
  return null
}