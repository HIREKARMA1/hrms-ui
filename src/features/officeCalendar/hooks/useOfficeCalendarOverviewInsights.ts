import { useMemo } from 'react'



import {

  useGetCalendarTodayQuery,

  useGetCalendarUpcomingQuery,

} from '../api/calendarApi'

import type { OfficeCalendarEventListSource } from '../context/officeCalendarContext'

import { mapApiCalendarEventsListToOfficeEvents } from '../utils/mapApiCalendarEventToOfficeEvent'

import { toDateKey } from '../utils/formatOfficeCalendarDate'



const CALENDAR_TIMEZONE = 'Asia/Kolkata'



export function useOfficeCalendarOverviewInsights(eventsSource: OfficeCalendarEventListSource) {

  const useLive = eventsSource === 'api'

  const todayKey = useMemo(() => toDateKey(new Date()), [])



  const {

    data: todayList,

    isFetching: todayFetching,

    isError: todayIsError,

  } = useGetCalendarTodayQuery(

    { date: todayKey, timezone: CALENDAR_TIMEZONE },

    { skip: !useLive },

  )



  const {

    data: upcomingList,

    isFetching: upcomingFetching,

    isError: upcomingIsError,

  } = useGetCalendarUpcomingQuery({ days: 30, limit: 6, page: 1 }, { skip: !useLive })



  const todayEvents = useMemo(

    () => (useLive ? mapApiCalendarEventsListToOfficeEvents(todayList?.items ?? []) : undefined),

    [todayList?.items, useLive],

  )



  const upcomingEvents = useMemo(

    () => (useLive ? mapApiCalendarEventsListToOfficeEvents(upcomingList?.items ?? []) : undefined),

    [upcomingList?.items, useLive],

  )



  return {

    todayEvents,

    upcomingEvents,

    insightsFetching: todayFetching || upcomingFetching,

    insightsError: useLive && (todayIsError || upcomingIsError),

  }

}
