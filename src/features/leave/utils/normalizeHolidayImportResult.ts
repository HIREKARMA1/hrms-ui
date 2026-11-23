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
  const rows: HolidayImportRowIssue[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const errorsRaw = record.errors ?? record.messages ?? record.error
    const errors = Array.isArray(errorsRaw)
      ? errorsRaw.map(String)
      : typeof errorsRaw === 'string'
        ? [errorsRaw]
        : []
    const rowNumber = Number(record.row ?? record.rowNumber ?? record.excelRow)
    const issue: HolidayImportRowIssue = {}
    if (rowNumber) issue.row = rowNumber
    if (errors.length) issue.errors = errors
    rows.push(issue)
  }
  return rows
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