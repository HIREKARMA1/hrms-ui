/**
 * Encashment requests from GET /leave-encashments (HR Requests → Encashment).
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { HrEncashmentRequestRow } from '../../types/api/leaveEncashmentList.types'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveThClass } from '../shared/leaveTableLayout'
import {
  HrEncashmentRequestTableRow,
  hrEncashmentEmployeeLabel,
} from './HrEncashmentRequestTableRow'

type HrEncashmentRequestsTableProps = {
  rows: HrEncashmentRequestRow[]
  employeeName: (id: string) => string
  emptyLabel?: string
  onView?: (row: HrEncashmentRequestRow) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  busyId?: string | null
}

export function HrEncashmentRequestsTable({
  rows,
  employeeName,
  emptyLabel = 'No encashment requests match your filters.',
  onView,
  onApprove,
  onReject,
  busyId = null,
}: HrEncashmentRequestsTableProps) {
  const permissions = useLeavePermissions()
  const showReview = Boolean(onApprove && onReject)
  const showActions = Boolean(onView || showReview)

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState message={emptyLabel} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-[44rem]')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left', 'w-[22%]')}>Employee</th>
              <th className={leaveThClass('left', 'w-[12%]')}>Type</th>
              <th className={leaveThClass('right', 'w-[10%]')}>Days</th>
              <th className={leaveThClass('left', 'w-[16%]')}>Requested</th>
              <th className={leaveThClass('left', 'w-[22%]')}>Status</th>
              {showActions ? <th className={leaveThClass('right', 'w-[18%]')}>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <HrEncashmentRequestTableRow
                key={row.id}
                row={row}
                label={hrEncashmentEmployeeLabel(row, employeeName)}
                showActions={showActions}
                showReview={showReview}
                canApprove={permissions.canApproveEncashment}
                canReject={permissions.canRejectEncashment}
                busyId={busyId}
                onView={onView}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}