/**
 * Clickable leave history table for My Leave with row actions and empty state.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type MyRequestsTableProps = {
  rows: LeaveRequest[]
  onView: (row: LeaveRequest) => void
  onCancel: (row: LeaveRequest) => void
  canCancel: (row: LeaveRequest) => boolean
  onApply?: () => void
}

function openRow(row: LeaveRequest, onView: (row: LeaveRequest) => void) {
  onView(row)
}

export function MyRequestsTable({ rows, onView, onCancel, canCancel, onApply }: MyRequestsTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState
            message="No leave requests to show."
            action={
              onApply ? (
                <Button type="button" size="sm" onClick={onApply}>
                  Apply for leave
                </Button>
              ) : null
            }
          />
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
              <th className={leaveThClass('left', 'w-[22%]')}>Leave type</th>
              <th className={leaveThClass('left', 'w-[14%]')}>From</th>
              <th className={leaveThClass('left', 'w-[14%]')}>To</th>
              <th className={leaveThClass('right', 'w-[8%]')}>Days</th>
              <th className={leaveThClass('left', 'w-[14%]')}>Applied on</th>
              <th className={leaveThClass('left', 'w-[18%]')}>Status</th>
              <th className={leaveThClass('right', 'w-[10%]')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={LEAVE_TABLE_ROW}
                tabIndex={0}
                onClick={() => openRow(row, onView)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRow(row, onView)
                  }
                }}
              >
                <td className={leaveTdClass('left')}>
                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                </td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.fromDate)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.toDate)}</td>
                <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <div className="flex flex-wrap gap-1">
                    <LeaveStatusPill status={row.currentStepLabel} />
                    {row.escalated ? <LeaveStatusPill status="Escalated" /> : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton>
                    {canCancel(row) ? (
                      <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => onCancel(row)}>
                        Cancel
                      </Button>
                    ) : null}
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
