import { useCallback, useEffect, useState } from 'react'

import {
  deleteOfficeEvent,
  deleteOfficeHoliday,
  fetchOfficeEvents,
  fetchOfficeHolidays,
  upsertOfficeEvent,
  upsertOfficeHoliday,
} from '../services/officeCalendarService'
import type {
  OfficeCalendarEvent,
  OfficeCalendarEventInput,
  OfficeHoliday,
  OfficeHolidayInput,
} from '../types/officeCalendar'
import type { OfficeCalendarContextValue } from '../context/officeCalendarContext'

export function useOfficeCalendarProviderState(): OfficeCalendarContextValue {
  const [events, setEvents] = useState<OfficeCalendarEvent[]>([])
  const [holidays, setHolidays] = useState<OfficeHoliday[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchOfficeEvents(), fetchOfficeHolidays()])
      .then(([nextEvents, nextHolidays]) => {
        setEvents(nextEvents)
        setHolidays(nextHolidays)
        setLoading(false)
      })
      .catch((cause: Error) => {
        setError(cause.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => load(), 0)
    return () => window.clearTimeout(handle)
  }, [load])

  const saveHoliday = useCallback(async (input: OfficeHolidayInput, id?: string) => {
    const saved = await upsertOfficeHoliday(input, id)
    setHolidays((current) => {
      if (id) {
        return current.map((item) => (item.id === id ? saved : item))
      }
      return [...current, saved]
    })
    return saved
  }, [])

  const removeHoliday = useCallback(async (id: string) => {
    await deleteOfficeHoliday(id)
    setHolidays((current) => current.filter((item) => item.id !== id))
  }, [])

  const saveEvent = useCallback(async (input: OfficeCalendarEventInput, id?: string) => {
    const saved = await upsertOfficeEvent(input, id)
    setEvents((current) => {
      if (id) {
        return current.map((item) => (item.id === id ? saved : item))
      }
      return [...current, saved]
    })
    return saved
  }, [])

  const removeEvent = useCallback(async (id: string) => {
    await deleteOfficeEvent(id)
    setEvents((current) => current.filter((item) => item.id !== id))
  }, [])

  return {
    events,
    holidays,
    loading,
    error,
    reload: load,
    saveHoliday,
    removeHoliday,
    saveEvent,
    removeEvent,
  }
}