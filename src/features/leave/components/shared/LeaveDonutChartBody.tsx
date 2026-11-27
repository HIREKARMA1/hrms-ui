/**
 * Shared donut chart body (Recharts) for leave type distribution UIs.
 */

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export type LeaveDonutSlice = {
  code: string
  label: string
  days: number
  percent: number
  color: string
}

type LeaveDonutChartBodyProps = {
  slices: LeaveDonutSlice[]
  totalDays: number
  hoverCode: string | null
  onHover: (code: string | null) => void
  onSliceClick?: (slice: LeaveDonutSlice) => void
  heightClassName?: string
  variant?: 'default' | 'overview'
}

export function LeaveDonutChartBody({
  slices,
  totalDays,
  hoverCode,
  onHover,
  onSliceClick,
  heightClassName = 'h-44',
  variant = 'default',
}: LeaveDonutChartBodyProps) {
  const hover = slices.find((slice) => slice.code === hoverCode)
  const overview = variant === 'overview'
  const pieHeight = overview ? 'h-[170px]' : heightClassName
  const innerRadius = overview ? '64%' : '58%'
  const outerRadius = overview ? '92%' : '88%'
  const strokeColor = overview ? '#EEF0F6' : 'var(--color-hrms-page)'
  return (
    <div className={`relative mx-auto w-full max-w-[220px] ${pieHeight}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="days"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            isAnimationActive={false}
            stroke={strokeColor}
            strokeWidth={2}
            onClick={(_, index) => onSliceClick?.(slices[index]!)}
          >
            {slices.map((slice) => (
              <Cell
                key={slice.code}
                fill={slice.color}
                opacity={hoverCode && hoverCode !== slice.code ? 0.45 : 1}
                onMouseEnter={() => onHover(slice.code)}
                onMouseLeave={() => onHover(null)}
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
            <span
              className={
                overview
                  ? 'text-[28px] font-bold tabular-nums text-[#17213A]'
                  : 'text-lg font-bold tabular-nums text-hrms-navy'
              }
            >
              {totalDays}
            </span>
            <span className={overview ? 'text-xs text-[#98A2B3]' : 'text-[10px] text-hrms-text-secondary'}>days</span>
          </>
        )}
      </div>
    </div>
  )
}