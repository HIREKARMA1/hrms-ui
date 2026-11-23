/**
 * Single day cell for the Overview 14-day outlook grid.
 */

import { cn } from '@/lib/utils'

import type { OutlookDayCell as DayModel } from '../../utils/overviewOutlook14'

type Props = {
  cell: DayModel
  index: number
  today: string
  maxCount: number
  focused: boolean
  hovered: boolean
  registerRef: (index: number, node: HTMLButtonElement | null) => void
  onOpen: (day: string) => void
  onKeyDown: (event: React.KeyboardEvent, index: number) => void
  onFocus: (index: number) => void
  onHover: (index: number | null) => void
}

export function OutlookDayCellUi({ cell, index, today, maxCount, focused, hovered, registerRef, onOpen, onKeyDown, onFocus, onHover }: Props) {
  return (
    <div className="relative min-w-0">
      {cell.monthLabel ? <span className="absolute -top-4 left-0 text-[10px] font-medium text-hrms-text-muted">{cell.monthLabel}</span> : null}
      <button
        type="button"
        ref={(node) => registerRef(index, node)}
        tabIndex={focused ? 0 : -1}
        title={cell.holidayNames[0]}
        onClick={() => onOpen(cell.iso)}
        onKeyDown={(event) => onKeyDown(event, index)}
        onFocus={() => onFocus(index)}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          'relative flex w-full flex-col items-center gap-0.5 rounded-lg border px-0.5 py-2 text-center text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus',
          cell.iso === today && 'border-hrms-primary ring-2 ring-hrms-primary ring-offset-1',
          cell.iso !== today && cell.weeklyOff && 'border-hrms-border bg-hrms-muted-bg/80 text-hrms-text-muted',
          cell.iso !== today && !cell.weeklyOff && cell.holidayNames.length > 0 && 'border-hrms-info/40 bg-hrms-info/10',
          cell.iso !== today && !cell.weeklyOff && !cell.holidayNames.length && 'border-hrms-border bg-white',
        )}
      >
        {cell.iso === today ? <span className="text-[9px] font-semibold text-hrms-primary">Today</span> : <span className="font-medium uppercase">{cell.weekday}</span>}
        <span className="text-sm font-semibold text-hrms-navy">{cell.dayNum}</span>
        <span className="text-xs font-bold tabular-nums text-hrms-navy">{cell.onLeaveCount}</span>
        <span className="h-1.5 w-full overflow-hidden rounded bg-hrms-muted-bg">
          <span className="block h-full bg-hrms-primary" style={{ width: `${(cell.onLeaveCount / maxCount) * 100}%` }} />
        </span>
        {cell.coverageRisk ? <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-hrms-warning" /> : null}
        {hovered && cell.onLeaveNames.length > 0 ? (
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-36 -translate-x-1/2 rounded-lg border border-hrms-border bg-white p-2 text-left text-[10px] text-hrms-text-secondary shadow-sm">
            {cell.onLeaveNames.slice(0, 5).map((name) => (
              <span key={name} className="block truncate">
                {name}
              </span>
            ))}
          </span>
        ) : null}
      </button>
    </div>
  )
}
