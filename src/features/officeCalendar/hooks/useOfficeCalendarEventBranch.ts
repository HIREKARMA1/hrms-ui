/**
 * Events list, search, and save/delete for Office Calendar provider (API or demo).
 */
import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'

import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useGetCalendarEventsQuery,
  useSearchCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '../api/calendarApi'
import type { OfficeCalendarEventListSource } from '../context/officeCalendarContext'
import { deleteOfficeEvent, upsertOfficeEvent } from '../services/officeCalendarService'
import type { OfficeCalendarEvent, OfficeCalendarEventInput } from '../types/officeCalendar'
import { calendarEventYearBounds } from '../utils/calendarEventYearBounds'
import { mapApiCalendarEventsListToOfficeEvents } from '../utils/mapApiCalendarEventToOfficeEvent'
import { mapOfficeEventInputToCreateRequest } from '../utils/mapOfficeEventInputToCreateRequest'

type DemoEventSlice = {
  demoEvents: OfficeCalendarEvent[]
  setDemoEvents: Dispatch<SetStateAction<OfficeCalendarEvent[]>>
}

export function useOfficeCalendarEventBranch(
  shouldFetchCalendarEvents: boolean,
  organizerEmployeeId: string | undefined,
  demo: DemoEventSlice,
) {
  const [eventYear, setEventYear] = useState(() => new Date().getFullYear())
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  const eventSearchText = eventSearchQuery.trim()

  const [createCalendarEvent] = useCreateCalendarEventMutation()
  const [updateCalendarEvent] = useUpdateCalendarEventMutation()
  const [deleteCalendarEvent] = useDeleteCalendarEventMutation()

  const {
    data: eventsList,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
    isError: eventsIsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetCalendarEventsQuery(eventYear, { skip: !shouldFetchCalendarEvents })

  const searchRange = useMemo(() => calendarEventYearBounds(eventYear), [eventYear])

  const {
    data: searchList,
    isFetching: eventSearchFetching,
    refetch: refetchSearch,
  } = useSearchCalendarEventsQuery(
    { q: eventSearchText, from: searchRange.from, to: searchRange.to },
    { skip: !shouldFetchCalendarEvents || eventSearchText.length < 1 },
  )

  const eventsSource: OfficeCalendarEventListSource = shouldFetchCalendarEvents ? 'api' : 'demo'

  const events = useMemo(() => {
    if (shouldFetchCalendarEvents) {
      if (eventSearchText.length >= 1) {
        return mapApiCalendarEventsListToOfficeEvents(searchList?.items ?? [])
      }
      return mapApiCalendarEventsListToOfficeEvents(eventsList?.items ?? [])
    }
    return demo.demoEvents
  }, [demo.demoEvents, eventSearchText, eventsList?.items, searchList?.items, shouldFetchCalendarEvents])

  const saveEvent = useCallback(
    async (input: OfficeCalendarEventInput, id?: string) => {
      if (shouldFetchCalendarEvents) {
        const body = mapOfficeEventInputToCreateRequest(input, { organizerEmployeeId })
        const saved = id
          ? await updateCalendarEvent({ id, body }).unwrap()
          : await createCalendarEvent(body).unwrap()
        const savedYear = Number(saved.startDate.slice(0, 4))
        if (savedYear && savedYear !== eventYear) setEventYear(savedYear)
        return saved
      }
      const saved = await upsertOfficeEvent(input, id)
      demo.setDemoEvents((current) => {
        if (id) return current.map((item) => (item.id === id ? saved : item))
        return [...current, saved]
      })
      return saved
    },
    [createCalendarEvent, demo, eventYear, organizerEmployeeId, shouldFetchCalendarEvents, updateCalendarEvent],
  )

  const removeEvent = useCallback(
    async (id: string) => {
      if (shouldFetchCalendarEvents) {
        await deleteCalendarEvent({ id, listYear: eventYear }).unwrap()
        return
      }
      await deleteOfficeEvent(id)
      demo.setDemoEvents((current) => current.filter((item) => item.id !== id))
    },
    [deleteCalendarEvent, demo, eventYear, shouldFetchCalendarEvents],
  )

  return {
    eventYear,
    setEventYear,
    eventSearchQuery,
    setEventSearchQuery,
    eventSearchFetching,
    events,
    eventsSource,
    eventsFetching,
    eventsLoading,
    eventsIsError,
    eventsError,
    eventSearchText,
    refetchEvents,
    refetchSearch,
    saveEvent,
    removeEvent,
  }
}