/**
 * Read-only encashment requests from GET /leave-encashments.
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { HrEncashmentRequestRow } from '../../types/api/leaveEncashmentList.types'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import { LEAVE_TABLE_BASE, leaveTdClass, leaveThClass } from '../shared/leaveTableLayout'

type HrEncashmentRequestsTableProps = {
  rows: HrEncashmentRequestRow[]
  employeeName: (id: string) => string
  emptyLabel?: string
  onView?: (row: HrEncashmentRequestRow) => void
}

export function HrEncashmentRequestsTable({
  rows,
  employeeName,
  emptyLabel = 'No encashment requests match your filters.',
  onView,
}: HrEncashmentRequestsTableProps) {
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
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-0')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left')}>Employee</th>
              <th className={leaveThClass('left')}>Type</th>
              <th className={leaveThClass('right')}>Days</th>
              <th className={leaveThClass('left')}>Requested</th>
              <th className={leaveThClass('left')}>Status</th>
              {onView ? <th className={leaveThClass('right')}>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={LEAVE_TABLE_ROW}
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
                <td className={leaveTdClass('left')}>
                  {row.employeeDisplayName ??
                    (employeeName(row.employeeId) || row.employeeId || '—')}
                </td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                </td>
                <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveStatusPill status={row.status} />
                </td>
                {onView ? (
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
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