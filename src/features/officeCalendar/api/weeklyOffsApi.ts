/**
 * RTK Query: GET/POST /calendar/weekly-offs and GET …/dates.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import { CALENDAR_VIEW_TIMEZONE } from '../constants/calendarViewTimezone'
import type {
  ConfigureWeeklyOffRequest,
  WeeklyOffDatesData,
  WeeklyOffDatesQuery,
  WeeklyOffPolicy,
  WeeklyOffPolicyQuery,
} from '../types/api/weeklyOffs.types'
import { normalizeWeeklyOffDates } from '../utils/normalizeWeeklyOffDates'
import { normalizeWeeklyOffPolicy } from '../utils/normalizeWeeklyOffPolicy'

export const weeklyOffsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWeeklyOffPolicy: build.query<WeeklyOffPolicy, WeeklyOffPolicyQuery | void>({
      query: (arg) => ({
        url: '/calendar/weekly-offs',
        params: { timezone: arg?.timezone ?? CALENDAR_VIEW_TIMEZONE },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeWeeklyOffPolicy(unwrapData(response)),
      providesTags: [{ type: 'WeeklyOff', id: 'POLICY' }],
    }),
    configureWeeklyOff: build.mutation<WeeklyOffPolicy, ConfigureWeeklyOffRequest>({
      query: (body) => ({
        url: '/calendar/weekly-offs',
        method: 'POST',
        body: {
          rules: body.rules,
          ...(body.timezone ? { timezone: body.timezone } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeWeeklyOffPolicy(unwrapData(response)),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(weeklyOffsApi.util.upsertQueryData('getWeeklyOffPolicy', undefined, data))
        } catch {
          /* keep cached policy on failed POST */
        }
      },
      invalidatesTags: [
        { type: 'WeeklyOff', id: 'POLICY' },
        { type: 'WeeklyOff', id: 'DATES' },
        { type: 'CalendarEvent' },
      ],
    }),
    getWeeklyOffDates: build.query<WeeklyOffDatesData, WeeklyOffDatesQuery>({
      query: ({ year, month, timezone = CALENDAR_VIEW_TIMEZONE }) => ({
        url: '/calendar/weekly-offs/dates',
        params: {
          year,
          ...(month !== undefined ? { month } : {}),
          timezone,
        },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeWeeklyOffDates(unwrapData(response)),
      providesTags: (_result, _error, arg) => [
        { type: 'WeeklyOff', id: `DATES-${arg.year}-${arg.month ?? 'ALL'}` },
        { type: 'WeeklyOff', id: 'DATES' },
      ],
    }),
  }),
})

export const {
  useGetWeeklyOffPolicyQuery,
  useLazyGetWeeklyOffPolicyQuery,
  useConfigureWeeklyOffMutation,
  useGetWeeklyOffDatesQuery,
  useLazyGetWeeklyOffDatesQuery,
} = weeklyOffsApi