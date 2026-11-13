/**
 * Pending leave queue table with row actions for ApprovalsTab.
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { ApproveRowButton, RejectRowButton, RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type ApprovalsLeaveTableProps = {
  rows: LeaveRequest[]
  employeeName: (id: string) => string
  onView: (row: LeaveRequest) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  busyId: string | null
}

export function ApprovalsLeaveTable({
  rows,
  employeeName,
  onView,
  onApprove,
  onReject,
  busyId,
}: ApprovalsLeaveTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState message="No pending leave requests in this queue." />
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
              <th className={leaveThClass('left', 'w-[18%]')}>Employee</th>
              <th className={leaveThClass('left', 'w-[10%]')}>Type</th>
              <th className={leaveThClass('left', 'w-[22%]')}>Dates</th>
              <th className={leaveThClass('right', 'w-[8%]')}>Days</th>
              <th className={leaveThClass('left', 'w-[12%]')}>Applied</th>
              <th className={leaveThClass('left', 'w-[8%]')}>Level</th>
              <th className={leaveThClass('left', 'w-[14%]')}>Status</th>
              <th className={leaveThClass('right', 'w-[16%]')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={LEAVE_TABLE_ROW}
                tabIndex={0}
                onClick={() => onView(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onView(row)
                  }
                }}
              >
                <td className={leaveTdClass('left')}>{employeeName(row.employeeId)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                </td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  {formatDate(row.fromDate)} – {formatDate(row.toDate)}
                </td>
                <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{row.currentLevel}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <div className="flex flex-wrap gap-1">
                    <LeaveStatusPill status={row.currentStepLabel} />
                    {row.escalated ? <LeaveStatusPill status="Escalated" /> : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton>
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
