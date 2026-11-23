/**

 * Donut chart of leave days by type with center hover state and legend navigation.

 */



import { useMemo, useState } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'



import type { LeaveSnapshot } from '../../services/leaveService'

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'

import type { LeaveTypeCode } from '../../constants/leaveTypeCodes'

import { leaveDaysByType } from '../../utils/overviewLeaveByType'

import { overviewRangeBounds, overviewRangeHint, type OverviewChartRange } from '../../utils/overviewRange'

import { OverviewCard } from './OverviewCard'

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

    <OverviewCard title="Leave by type" description="Share of approved leave days in the selected range." rangeHint={overviewRangeHint(range)} loading={loading} error={error} onRetry={onRetry} empty={empty} fillHeight>

      <div aria-label={summary} className="flex h-full flex-col gap-4">

        <div className="relative mx-auto h-44 w-full max-w-[220px]">

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie

                data={slices}

                dataKey="days"

                nameKey="label"

                innerRadius="58%"

                outerRadius="88%"

                isAnimationActive={false}

                stroke="var(--color-hrms-page)"

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

                <span className="text-lg font-bold tabular-nums text-hrms-navy">{totalDays}</span>

                <span className="text-[10px] text-hrms-text-secondary">days</span>

              </>

            )}

          </div>

        </div>

        <ul className="space-y-1 text-sm">

          {slices.map((slice) => (

            <li key={slice.code}>

              <button

                type="button"

                className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-hrms-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

                onMouseEnter={() => setHoverCode(slice.code)}

                onMouseLeave={() => setHoverCode(null)}

                onClick={() => onTypeSelect(slice.code)}

              >

                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: leaveTypeChartColors[slice.code] }} aria-hidden />

                <span className="min-w-0 flex-1 font-medium text-hrms-navy">{slice.label}</span>

                <span className="tabular-nums text-hrms-text-secondary">

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


