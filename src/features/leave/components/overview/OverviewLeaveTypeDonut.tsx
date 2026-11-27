/**

 * Donut chart of leave days by type with center hover state and legend navigation.

 */



import { useMemo, useState } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'



import type { LeaveSnapshot } from '../../services/leaveService'

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'

import type { LeaveTypeCode } from '../../constants/leaveTypeCodes'

import { leaveDaysByType } from '../../utils/overviewLeaveByType'

import { overviewRangeBounds, type OverviewChartRange } from '../../utils/overviewRange'

import { OverviewCard } from './OverviewCard'
import { OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'

import { DonutA11yTable } from './OverviewChartA11yTable'



type Props = {

  snapshot: LeaveSnapshot

  range: OverviewChartRange

  loading?: boolean

  error?: string | null

  onRetry?: () => void

  onTypeSelect: (code: LeaveTypeCode) => void

}



export function OverviewLeaveTypeDonut({ snapshot, range, loading, error, onRetry, onTypeSelect }: Props) {

  const { from, to } = overviewRangeBounds(range)

  const { slices, totalDays } = useMemo(() => leaveDaysByType(snapshot, from, to), [from, snapshot, to])

  const [hoverCode, setHoverCode] = useState<LeaveTypeCode | null>(null)

  const empty = slices.length === 0

  const hover = slices.find((slice) => slice.code === hoverCode)

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

        <div className="relative mx-auto h-[170px] w-full max-w-[220px]">

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie

                data={slices}

                dataKey="days"

                nameKey="label"

                innerRadius="64%"

                outerRadius="92%"

                isAnimationActive={false}

                stroke="#EEF0F6"

                strokeWidth={2}

                onClick={(_, index) => onTypeSelect(slices[index]?.code)}

              >

                {slices.map((slice) => (

                  <Cell

                    key={slice.code}

                    fill={leaveTypeChartColors[slice.code]}

                    opacity={hoverCode && hoverCode !== slice.code ? 0.45 : 1}

                    onMouseEnter={() => setHoverCode(slice.code)}

                    onMouseLeave={() => setHoverCode(null)}

                  />

                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">

            {hover ? (

              <>

                <span className="text-xs font-medium text-hrms-navy">{hover.label}</span>

                <span className="text-lg font-bold tabular-nums text-hrms-navy">{hover.days}</span>

                <span className="text-[10px] text-hrms-text-secondary">{Math.round(hover.percent)}%</span>

              </>

            ) : (

              <>

                <span className="text-[28px] font-bold tabular-nums text-[#17213A]">{totalDays}</span>

                <span className="text-xs text-[#98A2B3]">days</span>

              </>

            )}

          </div>

        </div>

        <ul className="space-y-0.5 text-sm">

          {slices.map((slice) => (

            <li key={slice.code}>

              <button

                type="button"

                className={cn('flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left hover:bg-[#F3F4F8]', OV_FOCUS)}

                onMouseEnter={() => setHoverCode(slice.code)}

                onMouseLeave={() => setHoverCode(null)}

                onClick={() => onTypeSelect(slice.code)}

              >

                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: leaveTypeChartColors[slice.code] }} aria-hidden />

                <span className="min-w-0 flex-1 text-[#17213A]">{slice.label}</span>

                <span className="shrink-0 tabular-nums text-[13px] text-[#667085]">

                  {slice.days} · {Math.round(slice.percent)}%

                </span>

              </button>

            </li>

          ))}

        </ul>

        <DonutA11yTable slices={slices} total={totalDays} />

      </div>

    </OverviewCard>

  )

}


