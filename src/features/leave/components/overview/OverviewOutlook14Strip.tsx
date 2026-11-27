/**
 * Fourteen-day outlook strip with summary, legend, tooltips, and day dialog.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { OutlookDayCell } from '../../utils/overviewOutlook14'
import { outlook14Days } from '../../utils/overviewOutlook14'
import { calendarDayLeaveDetail } from '../../utils/overviewOutlook14FromCalendar'
import type { BackendLeaveCalendarItem } from '../../api/leaveApi.types'

import { CalendarDayDetailDialog } from '../dialogs/CalendarDayDetailDialog'

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'

import { leaveTodayIso } from '../../utils/leaveToday'

import { OverviewCard } from './OverviewCard'

import { OverviewOutlookLegend } from './OverviewOutlookLegend'

import { OutlookDayCellUi } from './OverviewOutlookDayCell'

type Props = {
  snapshot: LeaveSnapshot
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  liveCells?: OutlookDayCell[] | null
  liveCalendarItems?: BackendLeaveCalendarItem[]
  liveTypeCodeById?: Map<string, string>
}

function busiestSubtitle(cells: OutlookDayCell[]): string {
  const busiest = cells.reduce(
    (best, cell) => (cell.onLeaveCount > (best?.onLeaveCount ?? -1) ? cell : best),
    cells[0],
  )
  if (!busiest || busiest.onLeaveCount === 0) {
    return 'Daily count of people on approved leave.'
  }
  const date = new Date(`${busiest.iso}T12:00:00`)
  const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  const n = busiest.onLeaveCount
  return `Busiest day: ${label} · ${n} ${n === 1 ? 'person' : 'people'} on leave`
}

function dayStripLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function selectedDayDetail(cell: OutlookDayCell | undefined, dayIso: string | null): string {
  if (!cell || !dayIso) return 'Select a day to see who is on leave.'
  const head = dayStripLabel(dayIso)
  if (cell.weeklyOff) return `${head} · Weekly off`
  if (cell.holidayNames.length > 0 && cell.onLeaveCount === 0) {
    return `${head} · Holiday${cell.holidayNames[0] ? ` (${cell.holidayNames[0]})` : ''}`
  }
  if (cell.onLeaveCount === 0) return `${head} · Nobody is on leave`
  const names = cell.onLeaveNames
  if (names.length > 0) {
    const list = names.slice(0, 3).join(', ')
    const more = names.length > 3 ? ` +${names.length - 3} more` : ''
    return `${head} · ${cell.onLeaveCount} on leave: ${list}${more}`
  }
  return `${head} · ${cell.onLeaveCount} on leave`
}

export function OverviewOutlook14Strip({
  snapshot,
  loading,
  error,
  onRetry,
  liveCells,
  liveCalendarItems,
  liveTypeCodeById,
}: Props) {
  const cells = useMemo(() => {
    if (liveCells) return liveCells
    return outlook14Days(snapshot)
  }, [liveCells, snapshot])

  const [focusIndex, setFocusIndex] = useState(0)
  const [selectedIso, setSelectedIso] = useState<string | null>(() => cells[0]?.iso ?? null)
  const [dialogDay, setDialogDay] = useState<string | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const focusButtons = useRef<(HTMLButtonElement | null)[]>([])
  const today = leaveTodayIso()
  const description = useMemo(() => busiestSubtitle(cells), [cells])

  useEffect(() => {
    focusButtons.current[focusIndex]?.focus()
  }, [focusIndex])

  const dayDetail = useMemo(() => {
    if (!dialogDay) return { holidays: [] as string[], onLeave: [] as { code: string; label: string }[] }

    const holidays = cells.find((cell) => cell.iso === dialogDay)?.holidayNames ?? []

    if (liveCalendarItems && liveTypeCodeById) {
      return calendarDayLeaveDetail(dialogDay, liveCalendarItems, liveTypeCodeById, holidays)
    }

    const onLeave = snapshot.requests
      .filter((row) => row.status === 'Approved' && row.fromDate <= dialogDay && row.toDate >= dialogDay)
      .map((row) => {
        const name = snapshot.employees.find((item) => item.id === row.employeeId)?.name ?? row.employeeId
        return {
          code: row.leaveTypeCode,
          label: `${name} · ${LEAVE_TYPE_LABELS[row.leaveTypeCode as LeaveTypeCode] ?? row.leaveTypeCode}`,
        }
      })

    return { holidays, onLeave }
  }, [cells, dialogDay, liveCalendarItems, liveTypeCodeById, snapshot])

  const selectedCell = useMemo(
    () => (selectedIso ? cells.find((cell) => cell.iso === selectedIso) : undefined),
    [cells, selectedIso],
  )

  const registerRef = useCallback((index: number, node: HTMLButtonElement | null) => {
    focusButtons.current[index] = node
  }, [])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setFocusIndex(Math.min(cells.length - 1, index + 1))
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setFocusIndex(Math.max(0, index - 1))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const iso = cells[index]?.iso ?? null
        if (iso) setSelectedIso(iso)
        setDialogDay(iso)
      }
    },
    [cells],
  )

  return (
    <OverviewCard
      chrome="overview"
      title="Next 14 days"
      description={description}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={false}
      skeleton="strip"
    >
      <div aria-label="Leave outlook for the next fourteen days" className="space-y-3 pt-1">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div
            className="grid min-w-max gap-2"
            style={{ gridTemplateColumns: 'repeat(14, minmax(58px, 1fr))' }}
          >
            {cells.map((cell, index) => (
              <OutlookDayCellUi
                key={cell.iso}
                cell={cell}
                index={index}
                today={today}
                focused={focusIndex === index}
                selected={selectedIso === cell.iso}
                hovered={hoverIndex === index}
                registerRef={registerRef}
                onSelect={(iso) => {
                  setSelectedIso(iso)
                  setFocusIndex(index)
                }}
                onKeyDown={onKeyDown}
                onFocus={setFocusIndex}
                onHover={setHoverIndex}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[10px] bg-[#F3F4F8] px-3.5 py-2.5 text-[13px] leading-snug text-[#17213A]">
          {selectedDayDetail(selectedCell, selectedIso)}
        </div>

        <OverviewOutlookLegend />
      </div>

      <CalendarDayDetailDialog
        open={Boolean(dialogDay)}
        day={dialogDay}
        holidays={dayDetail.holidays}
        onLeave={dayDetail.onLeave}
        onOpenChange={(open) => !open && setDialogDay(null)}
      />
    </OverviewCard>
  )
}