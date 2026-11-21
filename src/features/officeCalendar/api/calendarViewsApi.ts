/**
 * RTK Query: GET /calendar/view/monthly and GET /calendar/view/daily.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import { CALENDAR_VIEW_TIMEZONE } from '../constants/calendarViewTimezone'
import type {
  CalendarDailyViewData,
  CalendarMonthlyViewData,
  CalendarViewDailyQuery,
  CalendarViewMonthlyQuery,
} from '../types/api/calendarViews.types'
import { normalizeCalendarDailyView } from '../utils/normalizeCalendarDailyView'
import { normalizeCalendarMonthlyView } from '../utils/normalizeCalendarMonthlyView'

export const calendarViewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCalendarViewMonthly: build.query<CalendarMonthlyViewData, CalendarViewMonthlyQuery>({
      query: ({ year, month, timezone = CALENDAR_VIEW_TIMEZONE }) => ({
        url: '/calendar/view/monthly',
        params: { year, month, timezone },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarMonthlyView(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'CalendarEvent', id: `VIEW-MONTH-${arg.year}-${arg.month}` },
      ],
    }),
    getCalendarViewDaily: build.query<CalendarDailyViewData, CalendarViewDailyQuery>({
      query: ({ date, timezone = CALENDAR_VIEW_TIMEZONE }) => ({
        url: '/calendar/view/daily',
        params: { date, timezone },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarDailyView(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'CalendarEvent', id: `VIEW-DAY-${arg.date}` },
      ],
    }),
  }),
})

export const { useGetCalendarViewMonthlyQuery, useGetCalendarViewDailyQuery } = calendarViewsApi