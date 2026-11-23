/**
 * Dot legend for Overview stacked bar chart (placed above the chart).
 */

import { leaveTypeChartColors } from '../../constants/leaveTypeChartColors'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import { OVERVIEW_CHART_LEGEND_TEXT } from '../../utils/overviewChartTheme'

export function OverviewChartLegend({ types }: { types: LeaveTypeCode[] }) {
  if (types.length === 0) return null
  return (
    <ul className={`mb-3 flex flex-wrap gap-x-4 gap-y-1 ${OVERVIEW_CHART_LEGEND_TEXT}`}>
      {types.map((code) => (
        <li key={code} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: leaveTypeChartColors[code] }} aria-hidden />
          <span>{LEAVE_TYPE_LABELS[code]}</span>
        </li>
      ))}
    </ul>
  )
}
