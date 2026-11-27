/**
 * Bookable leave types from GET /leaves/balance — same source as Apply for leave.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { LeaveBalanceRow } from '../../api/leaveMappers'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'

type MyLeaveBalanceTableProps = {
  year: number
  rows: LeaveBalanceRow[]
  loading?: boolean
}

export function MyLeaveBalanceTable({ year, rows, loading }: MyLeaveBalanceTableProps) {
  return (
    <Card>
      <CardHeader className="border-b border-hrms-border pb-3">
        <CardTitle className="text-base font-semibold text-hrms-navy">Your leave balance ({year})</CardTitle>
        <p className="text-xs font-normal text-hrms-text-muted">
          Same data as Apply for leave — bookable types and available days from the server.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? <p className="p-4 text-sm text-hrms-text-muted">Loading balance…</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="p-4 text-sm text-hrms-text-muted">No leave balance for this year. Assign a policy or try another year.</p>
        ) : null}
        {!loading && rows.length > 0 ? (
          <div className="min-w-0 overflow-x-auto">
            <table className={cn(LEAVE_TABLE_BASE, 'text-sm')}>
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  <th className={leaveThClass('left')}>Leave type</th>
                  <th className={leaveThClass('right')}>Available</th>
                  <th className={leaveThClass('right')}>Used</th>
                  <th className={leaveThClass('right')}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.leaveTypeId} className={LEAVE_TABLE_ROW}>
                    <td className={leaveTdClass('left')}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                        <span className="font-medium text-hrms-navy">{row.leaveTypeName}</span>
                      </div>
                    </td>
                    <td className={leaveTdClass('right', 'tabular-nums font-medium')}>{row.available}</td>
                    <td className={leaveTdClass('right', 'tabular-nums')}>{row.used}</td>
                    <td className={leaveTdClass('right', 'tabular-nums')}>{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}