/**
 * Period summary chips for attendance analytics (totals in range, not headcount).
 */

import type { AttendanceAnalyticsSummary } from '../api/employeeDashboardApi.types'

type Props = {
  summary: AttendanceAnalyticsSummary | undefined
}

export function AttendanceAnalyticsPeriodSummary({ summary }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryChip label="Present" value={summary?.present ?? 0} color="#16A34A" />
        <SummaryChip label="Absent" value={summary?.absent ?? 0} color="#EF4444" />
        <SummaryChip label="On leave" value={summary?.onLeave ?? 0} color="#3B82F6" />
        <SummaryChip label="Late" value={summary?.late ?? 0} color="#F59E0B" />
      </div>
    </div>
  )
}

function SummaryChip({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-2">
      <p className="text-xs font-medium text-text-secondary">
        {label}
        <span className="block text-[10px] font-normal uppercase tracking-wide text-text-secondary/80">
          in period
        </span>
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-navy" style={{ color }}>
        {value}
      </p>
    </div>
  )
}