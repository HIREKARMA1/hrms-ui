/**
 * GET /calendar/export — downloads PDF or Excel (binary, not JSON).
 */
import type { RootState } from '@/app/store'
import { env } from '@/config/env'
import { baseApi } from '@/services/api/baseApi'

import { CALENDAR_VIEW_TIMEZONE } from '../constants/calendarViewTimezone'
import type { CalendarExportQuery, CalendarExportResult } from '../types/api/calendarExport.types'
import { parseCalendarExportFileName } from '../utils/parseCalendarExportFileName'

function buildExportUrl(params: CalendarExportQuery): string {
  const search = new URLSearchParams({
    format: params.format,
    timezone: params.timezone ?? CALENDAR_VIEW_TIMEZONE,
    from: params.from,
    to: params.to,
  })
  return `${env.apiBaseUrl}/calendar/export?${search.toString()}`
}

export const calendarExportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    exportCalendar: build.mutation<CalendarExportResult, CalendarExportQuery>({
      queryFn: async (params, { getState }) => {
        const token = (getState() as RootState).auth.accessToken
        if (!token) {
          return { error: { status: 401, data: 'Not signed in' } }
        }
        try {
          const response = await fetch(buildExportUrl(params), {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) {
            const detail = await response.text()
            return { error: { status: response.status, data: detail } }
          }
          const blob = await response.blob()
          const fileName = parseCalendarExportFileName(
            response.headers.get('Content-Disposition'),
            params.format,
            params.from,
            params.to,
          )
          return {
            data: {
              blob,
              fileName,
              truncated: response.headers.get('X-Export-Truncated') === 'true',
            },
          }
        } catch (cause) {
          return { error: { status: 'FETCH_ERROR', error: String(cause) } }
        }
      },
    }),
  }),
})

export const { useExportCalendarMutation } = calendarExportApi