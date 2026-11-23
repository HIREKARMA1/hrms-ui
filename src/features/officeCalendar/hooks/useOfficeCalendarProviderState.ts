/**
 * Composes Office Calendar context state from demo, holidays, and events branches.
 */
import { useCallback, useMemo } from 'react'

import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth/store/authSlice'

import type { OfficeCalendarContextValue } from '../context/officeCalendarContext'
import { resolveOfficeCalendarProviderError } from './officeCalendarProviderError'
import { useOfficeCalendarDemoData } from './useOfficeCalendarDemoData'
import { useOfficeCalendarEventBranch } from './useOfficeCalendarEventBranch'
import { useOfficeCalendarHolidayBranch } from './useOfficeCalendarHolidayBranch'
import { useShouldFetchCalendarEvents } from './useShouldFetchCalendarEvents'
import { useShouldFetchHolidays } from './useShouldFetchHolidays'

export function useOfficeCalendarProviderState(): OfficeCalendarContextValue {
  const authUser = useAppSelector(selectCurrentUser)
  const shouldFetchHolidays = useShouldFetchHolidays()
  const shouldFetchCalendarEvents = useShouldFetchCalendarEvents()

  const demo = useOfficeCalendarDemoData(shouldFetchCalendarEvents, shouldFetchHolidays)
  const holidaysBranch = useOfficeCalendarHolidayBranch(shouldFetchHolidays, {
    demoHolidays: demo.demoHolidays,
    setDemoHolidays: demo.setDemoHolidays,
  })
  const eventsBranch = useOfficeCalendarEventBranch(shouldFetchCalendarEvents, authUser?.employeeId, {
    demoEvents: demo.demoEvents,
    setDemoEvents: demo.setDemoEvents,
  })

  const loading =
    (shouldFetchCalendarEvents ? eventsBranch.eventsLoading : demo.demoEventsLoading) ||
    (shouldFetchHolidays ? holidaysBranch.holidaysLoading : demo.demoHolidaysLoading)

  const error = useMemo(
    () =>
      resolveOfficeCalendarProviderError({
        shouldFetchCalendarEvents,
        shouldFetchHolidays,
        eventsIsError: eventsBranch.eventsIsError,
        eventsError: eventsBranch.eventsError,
        demoEventsError: demo.demoEventsError,
        holidaysIsError: holidaysBranch.holidaysIsError,
        holidaysError: holidaysBranch.holidaysError,
        demoHolidaysError: demo.demoHolidaysError,
      }),
    [
      demo.demoEventsError,
      demo.demoHolidaysError,
      eventsBranch.eventsError,
      eventsBranch.eventsIsError,
      holidaysBranch.holidaysError,
      holidaysBranch.holidaysIsError,
      shouldFetchCalendarEvents,
      shouldFetchHolidays,
    ],
  )

  const reload = useCallback(() => {
    if (shouldFetchCalendarEvents) {
      void eventsBranch.refetchEvents()
      if (eventsBranch.eventSearchText.length >= 1) void eventsBranch.refetchSearch()
    } else demo.loadDemoEvents()
    if (shouldFetchHolidays) void holidaysBranch.refetchHolidays()
    else demo.loadDemoHolidays()
  }, [demo, eventsBranch, holidaysBranch, shouldFetchCalendarEvents, shouldFetchHolidays])

  return {
    events: eventsBranch.events,
    holidays: holidaysBranch.holidays,
    holidayYear: holidaysBranch.holidayYear,
    setHolidayYear: holidaysBranch.setHolidayYear,
    holidaysSource: holidaysBranch.holidaysSource,
    holidaysFetching: holidaysBranch.holidaysFetching,
    eventYear: eventsBranch.eventYear,
    setEventYear: eventsBranch.setEventYear,
    eventsSource: eventsBranch.eventsSource,
    eventsFetching: eventsBranch.eventsFetching,
    eventSearchQuery: eventsBranch.eventSearchQuery,
    setEventSearchQuery: eventsBranch.setEventSearchQuery,
    eventSearchFetching: eventsBranch.eventSearchFetching,
    loading,
    error,
    reload,
    saveHoliday: holidaysBranch.saveHoliday,
    removeHoliday: holidaysBranch.removeHoliday,
    saveEvent: eventsBranch.saveEvent,
    removeEvent: eventsBranch.removeEvent,
  }
}