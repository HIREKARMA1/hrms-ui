/**
 * Demo mock events/holidays when API permissions are missing.
 */
import { useCallback, useEffect, useState } from 'react'

import { fetchOfficeEvents, fetchOfficeHolidays } from '../services/officeCalendarService'
import type { OfficeCalendarEvent, OfficeHoliday } from '../types/officeCalendar'

export function useOfficeCalendarDemoData(
  shouldFetchCalendarEvents: boolean,
  shouldFetchHolidays: boolean,
) {
  const [demoEvents, setDemoEvents] = useState<OfficeCalendarEvent[]>([])
  const [demoEventsLoading, setDemoEventsLoading] = useState(!shouldFetchCalendarEvents)
  const [demoEventsError, setDemoEventsError] = useState<string | null>(null)

  const [demoHolidays, setDemoHolidays] = useState<OfficeHoliday[]>([])
  const [demoHolidaysLoading, setDemoHolidaysLoading] = useState(!shouldFetchHolidays)
  const [demoHolidaysError, setDemoHolidaysError] = useState<string | null>(null)

  const loadDemoEvents = useCallback(() => {
    setDemoEventsLoading(true)
    setDemoEventsError(null)
    fetchOfficeEvents()
      .then(setDemoEvents)
      .catch((cause: Error) => setDemoEventsError(cause.message))
      .finally(() => setDemoEventsLoading(false))
  }, [])

  const loadDemoHolidays = useCallback(() => {
    setDemoHolidaysLoading(true)
    setDemoHolidaysError(null)
    fetchOfficeHolidays()
      .then(setDemoHolidays)
      .catch((cause: Error) => setDemoHolidaysError(cause.message))
      .finally(() => setDemoHolidaysLoading(false))
  }, [])

  useEffect(() => {
    if (shouldFetchCalendarEvents) return
    const handle = window.setTimeout(() => loadDemoEvents(), 0)
    return () => window.clearTimeout(handle)
  }, [loadDemoEvents, shouldFetchCalendarEvents])

  useEffect(() => {
    if (shouldFetchHolidays) return
    const handle = window.setTimeout(() => loadDemoHolidays(), 0)
    return () => window.clearTimeout(handle)
  }, [loadDemoHolidays, shouldFetchHolidays])

  return {
    demoEvents,
    setDemoEvents,
    demoEventsLoading,
    demoEventsError,
    demoHolidays,
    setDemoHolidays,
    demoHolidaysLoading,
    demoHolidaysError,
    loadDemoEvents,
    loadDemoHolidays,
  }
}