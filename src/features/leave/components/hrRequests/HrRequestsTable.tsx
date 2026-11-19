/**
 * HR Requests tab table with employee status pill and escalation badge.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import type { LeaveRequest } from '../../types/leaveRequest'
import type { LeaveEmployee } from '../../types/employee'
import { resolveEmploymentStatus } from '../../utils/employmentStatus'
import { formatDate } from '../../utils/formatDate'
import { EmploymentStatusPill } from '../EmploymentStatusPill'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { ApproveRowButton, RejectRowButton, RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type HrRequestsTableProps = {
  rows: LeaveRequest[]
  employees: LeaveEmployee[]
  requests: LeaveRequest[]
  onView: (row: LeaveRequest) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onCancel: (row: LeaveRequest) => void
  busyId: string | null
}

function hrRowCancelVisible(row: LeaveRequest) {
  return row.status !== 'Cancelled' && row.status !== 'Rejected'
}

export function HrRequestsTable({ rows, employees, requests, onView, onApprove, onReject, onCancel, busyId }: HrRequestsTableProps) {
  const permissions = useLeavePermissions()
  const byId = Object.fromEntries(employees.map((item) => [item.id, item]))

  return (
    <Card>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-[52rem]')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left', 'w-[16%]')}>Employee</th>
              <th className={leaveThClass('left', 'w-[9%]')}>Type</th>
              <th className={leaveThClass('left', 'w-[22%]')}>Dates</th>
              <th className={leaveThClass('right', 'w-[7%]')}>Days</th>
              <th className={leaveThClass('left', 'w-[11%]')}>Applied on</th>
              <th className={leaveThClass('left', 'w-[17%]')}>Status</th>
              <th className={leaveThClass('right', 'w-[18%]')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const emp = byId[row.employeeId]
              const employment = emp ? resolveEmploymentStatus(emp, requests) : 'ACTIVE'
              const statusLabel = row.currentStepLabel || row.status
              const pending = row.status === 'Pending'
              const showCancel = !pending && hrRowCancelVisible(row)
              return (
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
                  <td className={leaveTdClass('left')}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-hrms-navy">{emp?.name ?? row.employeeId}</span>
                      <EmploymentStatusPill status={employment} />
                    </div>
                  </td>
                  <td className={leaveTdClass('left', 'font-normal')}>
                    <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                  </td>
                  <td className={leaveTdClass('left', 'font-normal')}>
                    {formatDate(row.fromDate)} – {formatDate(row.toDate)}
                  </td>
                  <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                  <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                  <td className={leaveTdClass('left', 'font-normal')}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <LeaveStatusPill status={statusLabel} />
                      {row.escalated ? <LeaveStatusPill status="Escalated" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-middle" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton>
                      {pending && permissions.canApprove ? (
                        <>
                          <ApproveRowButton disabled={busyId === row.id} onClick={() => onApprove(row.id)} />
                          <RejectRowButton disabled={busyId === row.id} onClick={() => onReject(row.id)} />
                        </>
                      ) : null}
                      {showCancel && permissions.canCancel ? (
                        <Button type="button" size="sm" variant="outline" className="h-8 border-hrms-border text-hrms-navy" onClick={() => onCancel(row)}>
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
