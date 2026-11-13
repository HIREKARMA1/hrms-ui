/**
 * Manager encashment approval queue table.
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { EncashmentRequest } from '../../types/encashment'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { ApproveRowButton, RejectRowButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type ApprovalsEncashmentTableProps = {
  rows: EncashmentRequest[]
  employeeName: (id: string) => string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  busyId: string | null
}

export function ApprovalsEncashmentTable({
  rows,
  employeeName,
  onApprove,
  onReject,
  busyId,
}: ApprovalsEncashmentTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState message="No encashment requests from your team." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left')}>Employee</th>
              <th className={leaveThClass('left')}>Type</th>
              <th className={leaveThClass('right')}>Days</th>
              <th className={leaveThClass('left')}>Requested</th>
              <th className={leaveThClass('left')}>Status</th>
              <th className={leaveThClass('right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={LEAVE_TABLE_ROW}>
                <td className={leaveTdClass('left')}>{employeeName(row.employeeId)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                </td>
                <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveStatusPill status={row.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ApproveRowButton disabled={busyId === row.id} onClick={() => onApprove(row.id)} />
                    <RejectRowButton disabled={busyId === row.id} onClick={() => onReject(row.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
