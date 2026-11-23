import { useMemo } from 'react'



import { useGetCalendarUpcomingQuery } from '../api/calendarApi'

import type { OfficeCalendarEventListSource } from '../context/officeCalendarContext'

import { mapApiCalendarEventsListToOfficeEvents } from '../utils/mapApiCalendarEventToOfficeEvent'

import { scheduleItemsFromOfficeEvents } from '../utils/scheduleItemsFromOfficeEvents'

import { toDateKey } from '../utils/formatOfficeCalendarDate'



export function useOfficeCalendarScheduleUpcoming(eventsSource: OfficeCalendarEventListSource) {

  const useLive = eventsSource === 'api'

  const todayKey = useMemo(() => toDateKey(new Date()), [])



  const { data, isFetching } = useGetCalendarUpcomingQuery(

    { days: 60, limit: 8, page: 1 },

    { skip: !useLive },

  )



  const items = useMemo(() => {

    if (!useLive) return undefined

    const events = mapApiCalendarEventsListToOfficeEvents(data?.items ?? [])

    return scheduleItemsFromOfficeEvents(events).filter((row) => row.dateKey >= todayKey)

  }, [data?.items, todayKey, useLive])



  return { upcomingItems: items, upcomingFetching: isFetching }

}
