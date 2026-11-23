/**
 * RTK: GET /calendar/holidays/download, POST import, POST {id}/notify.
 */
import type { RootState } from '@/app/store'
import { env } from '@/config/env'
import { parseHolidayCalendarFileName } from '@/features/officeCalendar/utils/parseHolidayCalendarFileName'
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  HolidayCalendarDownloadQuery,
  HolidayCalendarDownloadResult,
  HolidayImportRequest,
  HolidayImportResult,
  HolidayNotifyRequest,
  HolidayNotifyResult,
} from '../types/api/holidayCalendar.types'
import { normalizeHolidayImportResult } from '../utils/normalizeHolidayImportResult'
import { normalizeHolidayNotifyResult } from '../utils/normalizeHolidayNotifyResult'

function buildDownloadUrl(params: HolidayCalendarDownloadQuery): string {
  const search = new URLSearchParams({ format: params.format })
  if (params.year !== undefined) search.set('year', String(params.year))
  return `${env.apiBaseUrl}/calendar/holidays/download?${search.toString()}`
}

export const holidayCalendarApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    downloadHolidayCalendar: build.mutation<HolidayCalendarDownloadResult, HolidayCalendarDownloadQuery>({
      queryFn: async (params, { getState }) => {
        const token = (getState() as RootState).auth.accessToken
        if (!token) return { error: { status: 401, data: 'Not signed in' } }
        const year = params.year ?? new Date().getFullYear()
        try {
          const response = await fetch(buildDownloadUrl(params), {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) {
            const detail = await response.text()
            return { error: { status: response.status, data: detail } }
          }
          const blob = await response.blob()
          const fileName = parseHolidayCalendarFileName(
            response.headers.get('Content-Disposition'),
            params.format,
            year,
          )
          const totalHeader = response.headers.get('X-Total-Holidays')
          return {
            data: {
              blob,
              fileName,
              totalHolidays: totalHeader ? Number(totalHeader) : undefined,
            },
          }
        } catch (cause) {
          return { error: { status: 'FETCH_ERROR', error: String(cause) } }
        }
      },
    }),
    importHolidayCalendar: build.mutation<HolidayImportResult, HolidayImportRequest>({
      query: ({ file }) => {
        const body = new FormData()
        body.append('file', file, file.name)
        return { url: '/calendar/holidays/import', method: 'POST', body }
      },
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeHolidayImportResult(unwrapData(response)),
      invalidatesTags: [{ type: 'Holiday' }],
    }),
    notifyHoliday: build.mutation<HolidayNotifyResult, HolidayNotifyRequest>({
      query: ({ id, resend }) => ({
        url: `/calendar/holidays/${encodeURIComponent(id)}/notify`,
        method: 'POST',
        body: resend ? { resend: true } : {},
      }),
      transformResponse: (response: ApiResponse<unknown>) =>
        normalizeHolidayNotifyResult(unwrapData(response)),
    }),
  }),
})

export const {
  useDownloadHolidayCalendarMutation,
  useImportHolidayCalendarMutation,
  useNotifyHolidayMutation,
} = holidayCalendarApi