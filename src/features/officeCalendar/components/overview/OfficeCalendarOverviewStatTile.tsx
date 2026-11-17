/**
 * Single KPI stat tile on Office Calendar Overview summary card.
 */

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { OfficeCalendarOverviewTone } from '../../constants/officeCalendarOverviewTypeColors'
import { OFFICE_CALENDAR_OVERVIEW_TONE_STYLES } from '../../constants/officeCalendarOverviewTypeColors'
import { OVERVIEW_MOTION } from './officeCalendarOverviewUi'

type OfficeCalendarOverviewStatTileProps = {
  label: string
  value: number
  icon: LucideIcon
  tone: OfficeCalendarOverviewTone
  onClick?: () => void
}

export function OfficeCalendarOverviewStatTile({
  label,
  value,
  icon: Icon,
  tone,
  onClick,
}: OfficeCalendarOverviewStatTileProps) {
  const styles = OFFICE_CALENDAR_OVERVIEW_TONE_STYLES[tone]
  const clickable = Boolean(onClick)

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-hrms-border bg-white p-4 text-left',
        styles.bottomBar,
        OVERVIEW_MOTION,
        clickable && 'cursor-pointer hover:bg-hrms-row-hover',
        !clickable && 'cursor-default',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', styles.iconTile)}
        >
          <Icon className={cn('h-5 w-5', styles.icon)} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-hrms-navy">{value}</p>
          <p className="text-sm text-hrms-text-secondary">{label}</p>
        </div>
      </div>
    </button>
  )
}