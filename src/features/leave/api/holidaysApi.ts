import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { OfficeHoliday } from '@/features/officeCalendar/types/officeCalendar'

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
  }),
})

export const { useGetHolidaysQuery, useGetHolidayByIdQuery } = holidaysApi