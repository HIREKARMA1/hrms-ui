/** GET /calendar/holidays/download */

export type HolidayCalendarDownloadFormat = 'pdf' | 'xlsx'

export type HolidayCalendarDownloadQuery = {
  year?: number
  format: HolidayCalendarDownloadFormat
}

export type HolidayCalendarDownloadResult = {
  blob: Blob
  fileName: string
  totalHolidays?: number
}

/** POST /calendar/holidays/import */

export const HOLIDAY_IMPORT_MAX_BYTES = 2 * 1024 * 1024

export type HolidayImportRequest = {
  file: File
}

export type HolidayImportSummary = {
  totalRows: number
  imported: number
  failed: number
  duplicates: number
}

export type HolidayImportRowIssue = {
  row?: number
  errors?: string[]
}

export type HolidayImportResult = {
  status: string
  summary: HolidayImportSummary
  rows: HolidayImportRowIssue[]
}

/** POST /calendar/holidays/{id}/notify */

export type HolidayNotifyRequest = {
  id: string
  resend?: boolean
}

export type HolidayNotifyResult = {
  status: string
  recipientCount?: number
  sent?: number
  failed?: number
  notifiedAt?: string
}