/**

 * Stacked bar chart of leave days per month for HR Overview.

 */



import { useMemo } from 'react'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'



import type { LeaveSnapshot } from '../../services/leaveService'

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'


import { leaveDaysByMonthAndType } from '../../utils/overviewLeaveTrend'

import { overviewRangeBounds, overviewRangeHint, type OverviewChartRange } from '../../utils/overviewRange'

import { OVERVIEW_CHART_TICK } from '../../utils/overviewChartTheme'

import { OverviewCard } from './OverviewCard'

import { TrendA11yTable } from './OverviewChartA11yTable'

import { OverviewChartLegend } from './OverviewChartLegend'

import { OverviewTrendTooltip } from './OverviewTrendTooltip'



type Props = {

  snapshot: LeaveSnapshot

  range: OverviewChartRange

  loading?: boolean

  error?: string | null

  onRetry?: () => void

}



export function OverviewLeaveTrendChart({ snapshot, range, loading, error, onRetry }: Props) {

  const { from, to } = overviewRangeBounds(range)

  const { rows, types } = useMemo(() => leaveDaysByMonthAndType(snapshot, from, to), [from, snapshot, to])

  const empty = rows.every((row) => row.total <= 0)

  const summary = `Leave trend: ${rows.length} months, ${Math.round(rows.reduce((s, r) => s + r.total, 0))} total days`



  return (

    <OverviewCard title="Leave trend" description="Approved leave days per month, stacked by type." rangeHint={overviewRangeHint(range)} loading={loading} error={error} onRetry={onRetry} empty={empty} emptyMessage="No approved leave in this range." fillHeight>

      <div aria-label={summary} className="flex h-full min-h-[14rem] flex-col">

        <OverviewChartLegend types={types} />

        <div className="min-h-0 flex-1 w-full">

          <ResponsiveContainer width="100%" height={220}>

            <BarChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-hrms-border)" />

              <XAxis dataKey="label" tick={OVERVIEW_CHART_TICK} axisLine={false} tickLine={false} />

              <YAxis allowDecimals={false} tick={OVERVIEW_CHART_TICK} axisLine={false} tickLine={false} width={28} />

              <Tooltip cursor={{ fill: 'var(--color-hrms-muted-bg)', opacity: 0.35 }} content={<OverviewTrendTooltip />} />

              {types.map((code, index) => (

                <Bar

                  key={code}

                  dataKey={code}

                  stackId="a"

                  fill={leaveTypeChartColors[code]}

                  isAnimationActive={false}

                  maxBarSize={40}

                  radius={index === types.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}

                />

              ))}

            </BarChart>

          </ResponsiveContainer>

        </div>

        <TrendA11yTable rows={rows} types={types} />

      </div>

    </OverviewCard>

  )

}


