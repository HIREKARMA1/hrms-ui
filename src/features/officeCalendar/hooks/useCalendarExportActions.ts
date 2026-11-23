/**
 * PDF/Excel export actions for the visible schedule month.
 */
import { useCallback } from 'react'

import { useExportCalendarMutation } from '../api/calendarExportApi'
import type { CalendarExportFormat } from '../types/api/calendarExport.types'
import { calendarExportMonthRange } from '../utils/calendarExportMonthRange'
import { formatCalendarExportMonthLabel } from '../utils/formatCalendarExportMonthLabel'
import { downloadCalendarExportFile } from '../utils/downloadCalendarExportFile'
import { useCanExportCalendar } from './useCanExportCalendar'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'

export function useCalendarExportActions(month: Date) {
  const canExport = useCanExportCalendar()
  const { showToast } = useOfficeCalendarToast()
  const [exportCalendar, { isLoading }] = useExportCalendarMutation()

  const runExport = useCallback(
    async (format: CalendarExportFormat) => {
      const range = calendarExportMonthRange(month)
      try {
        const result = await exportCalendar({ format, ...range }).unwrap()
        downloadCalendarExportFile(result.blob, result.fileName)
        if (result.truncated) {
          showToast('Export capped at 20,000 events; see notice in the file.')
        } else {
          showToast(`Calendar ${format.toUpperCase()} downloaded for ${formatCalendarExportMonthLabel(month)}.`)
        }
      } catch {
        showToast('Calendar export failed. You need calendar:read and calendar:export.')
      }
    },
    [exportCalendar, month, showToast],
  )

  return {
    canExport,
    isExporting: isLoading,
    exportPdf: () => void runExport('pdf'),
    exportExcel: () => void runExport('xlsx'),
  }
}