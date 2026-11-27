/**
 * Leave-by-type donut fed from GET /dashboard/analytics/leaves (byLeaveType).
 */

import { useState } from 'react'

import { LeaveDonutChartBody } from '../shared/LeaveDonutChartBody'
import type { OverviewDonutSlice } from '../../utils/mapLeaveAnalyticsToOverview'
import type { OverviewChartRange } from '../../utils/overviewRange'
import { OverviewCard } from './OverviewCard'
import { OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'
import { DonutA11yTable } from './OverviewChartA11yTable'

type Props = {
  range: OverviewChartRange
  slices: OverviewDonutSlice[]
  totalDays: number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onTypeSelect: (search: string) => void
}

export function OverviewLeaveTypeDonutLive({
  range: _range,
  slices,
  totalDays,
  loading,
  error,
  onRetry,
  onTypeSelect,
}: Props) {
  const [hoverCode, setHoverCode] = useState<string | null>(null)
  const empty = slices.length === 0
  const summary = `Leave by type: ${totalDays} days across ${slices.length} types`

  return (
    <OverviewCard
      chrome="overview"
      className="w-full"
      title="Leave by type"
      description="Share of approved leave days in the selected range."
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={empty}
      fillHeight
    >
      <div aria-label={summary} className="flex h-full flex-col gap-4">
        <LeaveDonutChartBody
          variant="overview"
          slices={slices}
          totalDays={totalDays}
          hoverCode={hoverCode}
          onHover={setHoverCode}
          onSliceClick={(slice) => onTypeSelect(slice.label)}
        />
        <ul className="space-y-0.5 text-sm">
          {slices.map((slice) => (
            <li key={slice.code}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left hover:bg-[#F3F4F8]',
                  OV_FOCUS,
                )}
                onMouseEnter={() => setHoverCode(slice.code)}
                onMouseLeave={() => setHoverCode(null)}
                onClick={() => onTypeSelect(slice.label)}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-[#17213A]">{slice.label}</span>
                <span className="shrink-0 tabular-nums text-[13px] text-[#667085]">
                  {slice.days} · {Math.round(slice.percent)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
        <DonutA11yTable
          slices={slices.map((s) => ({
            code: s.code as import('../../constants/leaveTypeCodes').LeaveTypeCode,
            label: s.label,
            days: s.days,
            percent: s.percent,
          }))}
          total={totalDays}
        />
      </div>
    </OverviewCard>
  )
}