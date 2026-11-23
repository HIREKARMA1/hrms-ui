/**
 * Visually hidden data tables for Overview charts (screen readers).
 */

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import type { leaveDaysByMonthAndType } from '../../utils/overviewLeaveTrend'
import type { leaveDaysByType } from '../../utils/overviewLeaveByType'

export function TrendA11yTable({ rows, types }: { rows: ReturnType<typeof leaveDaysByMonthAndType>['rows']; types: LeaveTypeCode[] }) {
  return (
    <table className="sr-only">
      <caption>Leave days by month and type</caption>
      <thead>
        <tr>
          <th>Month</th>
          {types.map((code) => (
            <th key={code}>{LEAVE_TYPE_LABELS[code]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.month}>
            <td>{row.label}</td>
            {types.map((code) => (
              <td key={code}>{row[code] ?? 0}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function DonutA11yTable({ slices, total }: { slices: ReturnType<typeof leaveDaysByType>['slices']; total: number }) {
  return (
    <table className="sr-only">
      <caption>Leave days by type, total {total}</caption>
      <thead>
        <tr>
          <th>Type</th>
          <th>Days</th>
          <th>Percent</th>
        </tr>
      </thead>
      <tbody>
        {slices.map((row) => (
          <tr key={row.code}>
            <td>{row.label}</td>
            <td>{row.days}</td>
            <td>{row.percent}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
