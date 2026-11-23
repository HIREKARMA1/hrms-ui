/**
 * Custom stacked-bar tooltip for the Overview leave trend chart.
 */

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'

type PayloadRow = { dataKey?: string; value?: number; color?: string }

type Props = {
  active?: boolean
  label?: string
  payload?: PayloadRow[]
}

export function OverviewTrendTooltip({ active, label, payload }: Props) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((row) => Number(row.value) > 0)
  const total = rows.reduce((sum, row) => sum + Number(row.value ?? 0), 0)
  return (
    <div className="rounded-lg border border-hrms-border bg-white p-3 text-xs text-hrms-text-secondary shadow-sm">
      <p className="mb-2 font-medium text-hrms-navy">Month: {label}</p>
      <ul className="space-y-1">
        {rows.map((row) => {
          const code = String(row.dataKey) as LeaveTypeCode
          const color = row.color ?? leaveTypeChartColors[code]
          return (
            <li key={code} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              <span>
                {LEAVE_TYPE_LABELS[code] ?? code}: {Number(row.value).toFixed(1)} days
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 border-t border-hrms-border pt-2 font-medium text-hrms-navy">Total: {total.toFixed(1)} days</p>
    </div>
  )
}
