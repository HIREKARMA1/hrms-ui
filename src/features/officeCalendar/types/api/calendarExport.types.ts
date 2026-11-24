/**
 * Query and result for GET /calendar/export (PDF or Excel download).
 */
export type CalendarExportFormat = 'pdf' | 'xlsx'

export type CalendarExportQuery = {
  format: CalendarExportFormat
  from: string
  to: string
  timezone?: string
}

export type CalendarExportResult = {
  blob: Blob
  fileName: string
  truncated: boolean
}