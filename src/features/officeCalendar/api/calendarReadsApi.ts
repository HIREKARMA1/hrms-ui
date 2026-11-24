/**
 * RTK Query: calendar read-only endpoints (today, upcoming, search, widget).
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { CalendarEventsListData } from '../types/api/calendarEventsList.types'
import type {
  CalendarSearchQuery,
  CalendarTodayQuery,
  CalendarUpcomingQuery,
  CalendarWidgetUpcomingData,
  CalendarWidgetUpcomingQuery,
} from '../types/api/calendarReads.types'
import {
  normalizeCalendarEventsList,
  normalizeCalendarWidgetUpcoming,
} from '../utils/normalizeCalendarEventsList'

export const calendarReadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCalendarUpcoming: build.query<CalendarEventsListData, CalendarUpcomingQuery>({
      query: ({ days = 30, limit = 20, page = 1 } = {}) => ({
        url: '/calendar/upcoming',
        params: { days, limit, page },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarEventsList(unwrapData(response)),
      providesTags: [{ type: 'CalendarEvent', id: 'UPCOMING' }],
    }),
    getCalendarToday: build.query<CalendarEventsListData, CalendarTodayQuery>({
      query: ({ date, timezone = 'Asia/Kolkata' } = {}) => ({
        url: '/calendar/today',
        params: date ? { date, timezone } : { timezone },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarEventsList(unwrapData(response)),
      providesTags: [{ type: 'CalendarEvent', id: 'TODAY' }],
    }),
    getCalendarWidgetUpcoming: build.query<CalendarWidgetUpcomingData, CalendarWidgetUpcomingQuery>({
      query: ({ days = 30, limit = 5 } = {}) => ({
        url: '/calendar/widget/upcoming',
        params: { days, limit },
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        const raw = unwrapData(response)
        const { items, total } = normalizeCalendarWidgetUpcoming(raw)
        return { items, total }
      },
      providesTags: [{ type: 'CalendarEvent', id: 'WIDGET' }],
    }),
    searchCalendarEvents: build.query<CalendarEventsListData, CalendarSearchQuery>({
      query: ({ q, from, to, page = 1, limit = 100 }) => ({
        url: '/calendar/search',
        params: { q, from, to, page, limit, sortBy: 'startAt', sortOrder: 'asc' },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarEventsList(unwrapData(response)),
      providesTags: (_result, _error, arg) => [{ type: 'CalendarEvent', id: `SEARCH-${arg.q}` }],
    }),
  }),
})

export const {
  useGetCalendarUpcomingQuery,
  useGetCalendarTodayQuery,
  useGetCalendarWidgetUpcomingQuery,
  useSearchCalendarEventsQuery,
} = calendarReadsApi