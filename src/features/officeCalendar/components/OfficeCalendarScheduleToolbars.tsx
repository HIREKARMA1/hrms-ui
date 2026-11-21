/**
 * Combined search + export toolbar on the schedule tab (single filter bar).
 */
import { FileDown, Search, Sheet, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { OfficeCalendarEventListSource } from '../context/officeCalendarContext'
import { useCalendarExportActions } from '../hooks/useCalendarExportActions'
import { formatCalendarExportMonthLabel } from '../utils/formatCalendarExportMonthLabel'
import { CALENDAR_FILTER_BAR, CALENDAR_MOTION } from './shared/officeCalendarUi'

type OfficeCalendarScheduleToolbarsProps = {
  month: Date
  eventsSource: OfficeCalendarEventListSource
  eventSearchQuery: string
  onEventSearchQueryChange?: (query: string) => void
  eventSearchFetching: boolean
}

export function OfficeCalendarScheduleToolbars({
  month,
  eventsSource,
  eventSearchQuery,
  onEventSearchQueryChange,
  eventSearchFetching,
}: OfficeCalendarScheduleToolbarsProps) {
  const useLive = eventsSource === 'api'
  const exportActions = useCalendarExportActions(month)
  const monthLabel = formatCalendarExportMonthLabel(month)

  if (!useLive) return null

  return (
    <div className={`${CALENDAR_FILTER_BAR} flex flex-wrap items-center gap-2 gap-y-3`}>
      <div className="relative min-h-10 min-w-[12rem] flex-1 basis-[14rem]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hrms-text-muted" />
        <Input
          type="search"
          value={eventSearchQuery}
          onChange={(e) => onEventSearchQueryChange?.(e.target.value)}
          placeholder="Search events (title, description, location)…"
          className="h-10 rounded-xl pl-9"
          aria-busy={eventSearchFetching}
        />
      </div>
      {eventSearchQuery ? (
        <Button
          type="button"
          variant="outline"
          className={`h-10 rounded-xl ${CALENDAR_MOTION}`}
          onClick={() => onEventSearchQueryChange?.('')}
        >
          <X className="h-4 w-4" aria-hidden />
          Clear
        </Button>
      ) : null}
      {exportActions.canExport ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <span className="text-sm font-medium text-hrms-text-secondary">Export · {monthLabel}</span>
          <Button
            type="button"
            variant="outline"
            className={`h-10 rounded-xl ${CALENDAR_MOTION}`}
            disabled={exportActions.isExporting}
            onClick={exportActions.exportPdf}
          >
            <FileDown className="h-4 w-4" aria-hidden />
            PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            className={`h-10 rounded-xl ${CALENDAR_MOTION}`}
            disabled={exportActions.isExporting}
            onClick={exportActions.exportExcel}
          >
            <Sheet className="h-4 w-4" aria-hidden />
            Excel
          </Button>
        </div>
      ) : null}
    </div>
  )
}