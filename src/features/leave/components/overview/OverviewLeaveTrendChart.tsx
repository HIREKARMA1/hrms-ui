/**

 * Stacked bar chart of leave days per month for HR Overview.

 */



import { useMemo } from 'react'

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'



import type { LeaveSnapshot } from '../../services/leaveService'

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'


import { leaveDaysByMonthAndType, type LeaveTrendMonth } from '../../utils/overviewLeaveTrend'

import { overviewRangeBounds, type OverviewChartRange } from '../../utils/overviewRange'
import { leaveTodayIso } from '../../utils/leaveToday'

import { OverviewCard } from './OverviewCard'

import { TrendA11yTable } from './OverviewChartA11yTable'

import { OverviewChartLegend } from './OverviewChartLegend'

import { OverviewTrendTooltip } from './OverviewTrendTooltip'



type Props = {

  snapshot?: LeaveSnapshot

  range: OverviewChartRange

  loading?: boolean

  error?: string | null

  onRetry?: () => void

  live?: { rows: LeaveTrendMonth[]; types: import('../../constants/leaveTypeCodes').LeaveTypeCode[] }

  legendOverride?: Record<string, string>

}



export function OverviewLeaveTrendChart({ snapshot, range, loading, error, onRetry, live, legendOverride }: Props) {

  const { from, to } = overviewRangeBounds(range)

  const { rows, types } = useMemo(() => {
    if (live) return live
    if (!snapshot) return { rows: [], types: [] }
    return leaveDaysByMonthAndType(snapshot, from, to)
  }, [from, live, snapshot, to])

  const empty = rows.every((row) => row.total <= 0)

  const summary = `Leave trend: ${rows.length} months, ${Math.round(rows.reduce((s, r) => s + r.total, 0))} total days`
  const currentMonth = leaveTodayIso().slice(0, 7)

  return (

    <OverviewCard
      chrome="overview"
      title="Leave trend"
      description="Approved leave days per month, stacked by type."
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={empty}
      emptyMessage="No approved leave in this range."
      fillHeight
    >

      <div aria-label={summary} className="flex h-full min-h-[14rem] flex-col">

        <OverviewChartLegend types={types} labels={legendOverride} />

        <div className="min-h-0 flex-1 w-full">

          <ResponsiveContainer width="100%" height={220}>

            <BarChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E6EF" />

              <XAxis
                dataKey="label"
                tick={{ fill: '#98A2B3', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: '#98A2B3', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              <Tooltip cursor={{ fill: '#EEF0F6', opacity: 0.65 }} content={<OverviewTrendTooltip />} />

              {types.map((code, index) => (

                <Bar

                  key={code}

                  dataKey={code}

                  stackId="a"

                  fill={leaveTypeChartColors[code]}

                  isAnimationActive={false}

                  maxBarSize={44}

                  radius={index === types.length - 1 ? [7, 7, 0, 0] : [0, 0, 0, 0]}

                >
                  {rows.map((entry) => {
                    const active = entry.month === currentMonth && (entry.total ?? 0) > 0
                    const has = (entry.total ?? 0) > 0
                    return (
                      <Cell
                        key={`${code}-${entry.month}`}
                        fill={active ? '#5938DB' : has ? '#F0EDFF' : 'transparent'}
                      />
                    )
                  })}
                  {index === types.length - 1 ? (
                    <LabelList
                      dataKey="total"
                      position="top"
                      content={({ x, y, value, index: rowIndex }) => {
                        const row = rows[rowIndex as number]
                        if (!row || row.month !== currentMonth || value == null || Number(value) <= 0) {
                          return null
                        }
                        return (
                          <text
                            x={x}
                            y={y}
                            dy={-6}
                            textAnchor="middle"
                            fill="#17213A"
                            fontSize={11}
                            fontWeight={700}
                          >
                            {value}
                          </text>
                        )
                      }}
                    />
                  ) : null}
                </Bar>

              ))}

            </BarChart>

          </ResponsiveContainer>

        </div>

        <TrendA11yTable rows={rows} types={types} />

      </div>

    </OverviewCard>

  )

}


