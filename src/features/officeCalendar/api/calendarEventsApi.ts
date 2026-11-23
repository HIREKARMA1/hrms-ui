/**
 * RTK Query: calendar events list, detail, and CRUD mutations.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from '../types/api/calendarEventCreate.types'
import type { CalendarEventsListData } from '../types/api/calendarEventsList.types'
import type { OfficeCalendarEvent } from '../types/officeCalendar'
import { calendarEventsListQuery } from '../utils/calendarEventYearBounds'
import { mapApiCalendarEventToOfficeEvent } from '../utils/mapApiCalendarEventToOfficeEvent'
import { normalizeCalendarEventsList } from '../utils/normalizeCalendarEventsList'
import {
  CALENDAR_EVENT_READ_INVALIDATIONS,
  listYearFromIso,
  normalizeCalendarEventDetail,
} from './calendarApiHelpers'

export const calendarEventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCalendarEvents: build.query<CalendarEventsListData, number>({
      query: (year) => {
        const params = calendarEventsListQuery(year)
        return {
          url: '/calendar/events',
          params: {
            from: params.from,
            to: params.to,
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          },
        }
      },
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeCalendarEventsList(unwrapData(response)),
      providesTags: (_result, _error, year) => [{ type: 'CalendarEvent', id: `LIST-${year}` }],
    }),
    getCalendarEventById: build.query<OfficeCalendarEvent, string>({
      query: (id) => ({
        url: `/calendar/events/${encodeURIComponent(id)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiCalendarEventToOfficeEvent(normalizeCalendarEventDetail(unwrapData(response))),
      providesTags: (_result, _error, id) => [{ type: 'CalendarEvent', id }],
    }),
    createCalendarEvent: build.mutation<OfficeCalendarEvent, CreateCalendarEventRequest>({
      query: (body) => ({
        url: '/calendar/events',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiCalendarEventToOfficeEvent(normalizeCalendarEventDetail(unwrapData(response))),
      invalidatesTags: [
        ...CALENDAR_EVENT_READ_INVALIDATIONS,
        (_result, _error, arg) => [{ type: 'CalendarEvent', id: `LIST-${listYearFromIso(arg.startAt)}` }],
      ],
    }),
    updateCalendarEvent: build.mutation<
      OfficeCalendarEvent,
      { id: string; body: UpdateCalendarEventRequest }
    >({
      query: ({ id, body }) => ({
        url: `/calendar/events/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiCalendarEventToOfficeEvent(normalizeCalendarEventDetail(unwrapData(response))),
      invalidatesTags: [
        ...CALENDAR_EVENT_READ_INVALIDATIONS,
        (_result, _error, arg) => [
          { type: 'CalendarEvent', id: arg.id },
          { type: 'CalendarEvent', id: `LIST-${listYearFromIso(arg.body.startAt)}` },
        ],
      ],
    }),
    deleteCalendarEvent: build.mutation<null, { id: string; listYear: number }>({
      query: ({ id }) => ({
        url: `/calendar/events/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<null | unknown>) => {
        unwrapData(response)
        return null
      },
      invalidatesTags: [
        ...CALENDAR_EVENT_READ_INVALIDATIONS,
        (_result, _error, arg) => [
          { type: 'CalendarEvent', id: arg.id },
          { type: 'CalendarEvent', id: `LIST-${arg.listYear}` },
        ],
      ],
    }),
  }),
})

export const {
  useGetCalendarEventsQuery,
  useGetCalendarEventByIdQuery,
  useLazyGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = calendarEventsApi