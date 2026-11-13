/**

 * Fourteen-day outlook strip with summary, legend, tooltips, and day dialog.

 */



import { useCallback, useEffect, useMemo, useRef, useState } from 'react'



import type { LeaveSnapshot } from '../../services/leaveService'

import { outlook14Days, outlookBusiestDay } from '../../utils/overviewOutlook14'

import { CalendarDayDetailDialog } from '../dialogs/CalendarDayDetailDialog'

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'

import { leaveTodayIso } from '../../utils/leaveToday'

import { OverviewCard } from './OverviewCard'

import { OverviewOutlookLegend } from './OverviewOutlookLegend'

import { OutlookDayCellUi } from './OverviewOutlookDayCell'



type Props = { snapshot: LeaveSnapshot; loading?: boolean; error?: string | null; onRetry?: () => void }



export function OverviewOutlook14Strip({ snapshot, loading, error, onRetry }: Props) {

  const cells = useMemo(() => outlook14Days(snapshot), [snapshot])

  const [focusIndex, setFocusIndex] = useState(0)

  const [dialogDay, setDialogDay] = useState<string | null>(null)

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const focusButtons = useRef<(HTMLButtonElement | null)[]>([])

  const today = leaveTodayIso()

  const maxCount = Math.max(1, ...cells.map((cell) => cell.onLeaveCount))

  const busiest = outlookBusiestDay(cells)

  useEffect(() => {

    focusButtons.current[focusIndex]?.focus()

  }, [focusIndex])



  const dayDetail = useMemo(() => {

    if (!dialogDay) return { holidays: [] as string[], onLeave: [] as { code: string; label: string }[] }

    const holidays = cells.find((cell) => cell.iso === dialogDay)?.holidayNames ?? []

    const onLeave = snapshot.requests

      .filter((row) => row.status === 'Approved' && row.fromDate <= dialogDay && row.toDate >= dialogDay)

      .map((row) => {

        const name = snapshot.employees.find((item) => item.id === row.employeeId)?.name ?? row.employeeId

        return { code: row.leaveTypeCode, label: `${name} · ${LEAVE_TYPE_LABELS[row.leaveTypeCode as LeaveTypeCode] ?? row.leaveTypeCode}` }

      })

    return { holidays, onLeave }

  }, [cells, dialogDay, snapshot])



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

        setDialogDay(cells[index]?.iso ?? null)

      }

    },

    [cells],

  )



  return (

    <OverviewCard title="Next 14 days" description={busiest ?? 'Daily count of people on approved leave.'} loading={loading} error={error} onRetry={onRetry} empty={false} skeleton="strip">

      <div aria-label="Leave outlook for the next fourteen days" className="space-y-3 pt-2">

        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14">

          {cells.map((cell, index) => (

            <OutlookDayCellUi

              key={cell.iso}

              cell={cell}

              index={index}

              today={today}

              maxCount={maxCount}

              focused={focusIndex === index}

              hovered={hoverIndex === index}

              registerRef={registerRef}

              onOpen={setDialogDay}

              onKeyDown={onKeyDown}

              onFocus={setFocusIndex}

              onHover={setHoverIndex}

            />

          ))}

        </div>

        <OverviewOutlookLegend />

      </div>

      <CalendarDayDetailDialog open={Boolean(dialogDay)} day={dialogDay} holidays={dayDetail.holidays} onLeave={dayDetail.onLeave} onOpenChange={(open) => !open && setDialogDay(null)} />

    </OverviewCard>

  )

}


