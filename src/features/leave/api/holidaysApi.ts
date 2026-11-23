import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { OfficeHoliday } from '@/features/officeCalendar/types/officeCalendar'

import type { CreateHolidayRequest, UpdateHolidayRequest } from '../types/api/holidayCreate.types'
import type { ApiHolidayItem, HolidaysListData, HolidaysListQuery } from '../types/api/holidaysList.types'
import { mapApiHolidayToOfficeHoliday } from '../utils/mapApiHolidayToOfficeHoliday'

function normalizeHolidaysList(raw: unknown): HolidaysListData {
  if (Array.isArray(raw)) {
    return { items: raw as ApiHolidayItem[] }
  }
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw as HolidaysListData
  }
  if (raw && typeof raw === 'object' && 'holidays' in raw) {
    const holidays = (raw as { holidays: ApiHolidayItem[] }).holidays
    return { items: Array.isArray(holidays) ? holidays : [] }
  }
  return { items: [] }
}

function normalizeHolidayDetail(raw: unknown): ApiHolidayItem {
  if (raw && typeof raw === 'object' && 'holiday' in raw) {
    return (raw as { holiday: ApiHolidayItem }).holiday
  }
  if (raw && typeof raw === 'object' && 'item' in raw) {
    return (raw as { item: ApiHolidayItem }).item
  }
  return raw as ApiHolidayItem
}

export const holidaysApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /holidays — company holiday list (Calendar tab). */
    getHolidays: build.query<HolidaysListData, HolidaysListQuery>({
      query: ({ year }) => ({
        url: '/holidays',
        params: { year },
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeHolidaysList(unwrapData(response)),
      providesTags: (_result, _error, arg) => [{ type: 'Holiday', id: `LIST-${arg.year}` }],
    }),
    /** GET /holidays/{id} — single holiday (Office Calendar edit). */
    getHolidayById: build.query<OfficeHoliday, string>({
      query: (id) => ({
        url: `/holidays/${encodeURIComponent(id)}`,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiHolidayToOfficeHoliday(normalizeHolidayDetail(unwrapData(response))),
      providesTags: (_result, _error, id) => [{ type: 'Holiday', id }],
    }),
    /** POST /holidays — create a company holiday. */
    createHoliday: build.mutation<OfficeHoliday, CreateHolidayRequest>({
      query: (body) => ({
        url: '/holidays',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiHolidayToOfficeHoliday(normalizeHolidayDetail(unwrapData(response))),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Holiday', id: `LIST-${arg.holidayDate.slice(0, 4)}` },
      ],
    }),
    /** PATCH /holidays/{id} — update a company holiday. */
    updateHoliday: build.mutation<
      OfficeHoliday,
      { id: string; body: UpdateHolidayRequest }
    >({
      query: ({ id, body }) => ({
        url: `/holidays/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        mapApiHolidayToOfficeHoliday(normalizeHolidayDetail(unwrapData(response))),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Holiday', id: arg.id },
        { type: 'Holiday', id: `LIST-${arg.body.holidayDate.slice(0, 4)}` },
      ],
    }),
    /** DELETE /holidays/{id} — remove a company holiday. */
    deleteHoliday: build.mutation<null, { id: string; listYear: number }>({
      query: ({ id }) => ({
        url: `/holidays/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<null | unknown>) => {
        unwrapData(response)
        return null
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Holiday', id: arg.id },
        { type: 'Holiday', id: `LIST-${arg.listYear}` },
      ],
    }),
  }),
})

export const {
  useGetHolidaysQuery,
  useGetHolidayByIdQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = holidaysApi

export {
  useDownloadHolidayCalendarMutation,
  useImportHolidayCalendarMutation,
  useNotifyHolidayMutation,
} from './holidayCalendarApi'