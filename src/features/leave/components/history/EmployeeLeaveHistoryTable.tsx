/**
 * Read-only leave request rows from GET /leaves/history/{employeeId}.
 */
import { Card, CardContent } from '@/components/ui/card'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type EmployeeLeaveHistoryTableProps = {
  rows: LeaveRequest[]
  onView?: (row: LeaveRequest) => void
}

export function EmployeeLeaveHistoryTable({ rows, onView }: EmployeeLeaveHistoryTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState message="No leave history for this filter." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <table className={LEAVE_TABLE_BASE}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left')}>Applied</th>
              <th className={leaveThClass('left')}>From</th>
              <th className={leaveThClass('left')}>To</th>
              <th className={leaveThClass('left')}>Type</th>
              <th className={leaveThClass('right')}>Days</th>
              <th className={leaveThClass('left')}>Status</th>
              {onView ? <th className={leaveThClass('right', 'w-20')} /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={onView ? LEAVE_TABLE_ROW : 'border-b border-hrms-border/40'}
                tabIndex={onView ? 0 : undefined}
                onClick={onView ? () => onView(row) : undefined}
                onKeyDown={
                  onView
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onView(row)
                        }
                      }
                    : undefined
                }
              >
                <td className={leaveTdClass('left')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left')}>{formatDate(row.fromDate)}</td>
                <td className={leaveTdClass('left')}>{formatDate(row.toDate)}</td>
                <td className={leaveTdClass('left')}>
                  <LeaveTypeChip code={row.leaveTypeCode} />
                </td>
                <td className={leaveTdClass('right')}>{row.days}</td>
                <td className={leaveTdClass('left')}>
                  <LeaveStatusPill status={row.status} />
                </td>
                {onView ? (
                  <td className={leaveTdClass('right')}>
                    <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}