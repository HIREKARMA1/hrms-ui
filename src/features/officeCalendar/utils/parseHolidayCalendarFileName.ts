/**
 * Filename for GET /calendar/holidays/download (Content-Disposition or fallback).
 */
import type { HolidayCalendarDownloadFormat } from '@/features/leave/types/api/holidayCalendar.types'

export function parseHolidayCalendarFileName(
  contentDisposition: string | null,
  format: HolidayCalendarDownloadFormat,
  year: number,
): string {
  if (contentDisposition) {
    const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].trim())
    const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition)
    if (plainMatch?.[1]) return plainMatch[1].trim()
  }
  return `holiday-calendar-${year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
}