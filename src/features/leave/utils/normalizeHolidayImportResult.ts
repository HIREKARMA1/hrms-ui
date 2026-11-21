/**
 * Normalizes POST /calendar/holidays/import response data.
 */
import type {
  HolidayImportResult,
  HolidayImportRowIssue,
  HolidayImportSummary,
} from '../types/api/holidayCalendar.types'

function summary(raw: Record<string, unknown>): HolidayImportSummary {
  const s = raw.summary && typeof raw.summary === 'object' ? (raw.summary as Record<string, unknown>) : raw
  return {
    totalRows: Number(s.totalRows ?? s.total ?? 0),
    imported: Number(s.imported ?? 0),
    failed: Number(s.failed ?? 0),
    duplicates: Number(s.duplicates ?? 0),
  }
}

function rowIssues(raw: unknown): HolidayImportRowIssue[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const errorsRaw = record.errors ?? record.messages ?? record.error
      const errors = Array.isArray(errorsRaw)
        ? errorsRaw.map(String)
        : typeof errorsRaw === 'string'
          ? [errorsRaw]
          : []
      return {
        row: Number(record.row ?? record.rowNumber ?? record.excelRow) || undefined,
        errors: errors.length ? errors : undefined,
      }
    })
    .filter((r): r is HolidayImportRowIssue => r !== null)
}

export function normalizeHolidayImportResult(raw: unknown): HolidayImportResult {
  const body =
    raw && typeof raw === 'object' && 'data' in raw
      ? (raw as { data: unknown }).data
      : raw
  const root = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  return {
    status: String(root.status ?? 'COMPLETED'),
    summary: summary(root),
    rows: rowIssues(root.rows ?? root.failedRows),
  }
}