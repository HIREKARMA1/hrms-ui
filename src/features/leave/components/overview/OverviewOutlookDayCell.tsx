/**
 * Single day cell for the Overview 14-day outlook grid.
 */

import { cn } from '@/lib/utils'

import type { OutlookDayCell as DayModel } from '../../utils/overviewOutlook14'
import { OV_FOCUS } from './overviewVisual'

type Props = {
  cell: DayModel
  index: number
  today: string
  focused: boolean
  selected: boolean
  hovered: boolean
  registerRef: (index: number, node: HTMLButtonElement | null) => void
  onSelect: (day: string) => void
  onKeyDown: (event: React.KeyboardEvent, index: number) => void
  onFocus: (index: number) => void
  onHover: (index: number | null) => void
}

export function OutlookDayCellUi({
  cell,
  index,
  today,
  focused,
  selected,
  hovered,
  registerRef,
  onSelect,
  onKeyDown,
  onFocus,
  onHover,
}: Props) {
  const isToday = cell.iso === today
  const isHoliday = cell.holidayNames.length > 0
  const hasLeave = cell.onLeaveCount > 0
  const weekLabel = index === 0 ? 'Today' : isToday ? 'Today' : cell.weekday.slice(0, 1)

  return (
    <div className="relative min-w-[58px] shrink-0">
      {cell.monthLabel ? (
        <span className="absolute -top-4 left-0.5 text-[10px] font-medium text-[#98A2B3]">{cell.monthLabel}</span>
      ) : null}
      <button
        type="button"
        ref={(node) => registerRef(index, node)}
        tabIndex={focused ? 0 : -1}
        title={cell.holidayNames[0]}
        aria-pressed={selected}
        onClick={() => onSelect(cell.iso)}
        onKeyDown={(event) => onKeyDown(event, index)}
        onFocus={() => onFocus(index)}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          'relative flex min-h-[88px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-[#E2E6EF] bg-white px-1 py-2 text-center transition-[border-color,box-shadow] duration-150 hover:border-[#8B5CF6] motion-reduce:transition-none',
          OV_FOCUS,
          isToday && 'border-2 border-[#5938DB]',
          !isToday && cell.weeklyOff && 'border-dashed bg-[#EEF0F6]',
          !isToday && !cell.weeklyOff && isHoliday && 'border-[#3B82F6]/30 bg-[#3B82F61A]',
          !isToday && !cell.weeklyOff && !isHoliday && hasLeave && 'border-[#E2E6EF] bg-[#F0EDFF]',
          selected && 'ring-[3px] ring-[#8B5CF633]',
        )}
      >
        <span className={cn('text-[11px] font-medium', isToday || index === 0 ? 'text-[#5938DB]' : 'text-[#98A2B3]')}>
          {weekLabel}
        </span>
        <span className="text-[17px] font-bold tabular-nums text-[#17213A]">{cell.dayNum}</span>
        {hasLeave ? (
          <span className="mt-0.5 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[#5938DB] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {cell.onLeaveCount}
          </span>
        ) : (
          <span className="mt-0.5 text-[11px] tabular-nums text-[#CBD5E1]">0</span>
        )}
        {cell.coverageRisk ? (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" aria-label="Coverage limit" />
        ) : null}
        {hovered && cell.onLeaveNames.length > 0 ? (
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-36 -translate-x-1/2 rounded-lg border border-[#E2E6EF] bg-white p-2 text-left text-[10px] text-[#667085] shadow-sm">
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