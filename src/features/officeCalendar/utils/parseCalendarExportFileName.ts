/**
 * Parses Content-Disposition or builds a fallback name for calendar export files.
 */
import type { CalendarExportFormat } from '../types/api/calendarExport.types'

export function parseCalendarExportFileName(
  contentDisposition: string | null,
  format: CalendarExportFormat,
  from: string,
  to: string,
): string {
  if (contentDisposition) {
    const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].trim())
    const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition)
    if (plainMatch?.[1]) return plainMatch[1].trim()
  }
  const ext = format === 'pdf' ? 'pdf' : 'xlsx'
  return `calendar-export-${from}-to-${to}.${ext}`
}