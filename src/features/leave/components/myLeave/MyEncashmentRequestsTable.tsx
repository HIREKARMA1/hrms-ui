/**
 * Employee encashment history on My Leave (GET /leave-encashments).
 */

import { Button } from '@/components/ui/button'
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

type Props = {
  rows: HrEncashmentRequestRow[]
  onView: (row: HrEncashmentRequestRow) => void
  onRequest?: () => void
  emptyMessage?: string
}

export function MyEncashmentRequestsTable({
  rows,
  onView,
  onRequest,
  emptyMessage = 'No encashment requests to show.',
}: Props) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveEmptyState
            message={emptyMessage}
            action={
              onRequest ? (
                <Button type="button" size="sm" variant="outline" onClick={onRequest}>
                  Request encashment
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
        <table className={cn(LEAVE_TABLE_BASE, 'min-w-[36rem]')}>
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              <th className={leaveThClass('left', 'w-[18%]')}>Type</th>
              <th className={leaveThClass('right', 'w-[12%]')}>Days</th>
              <th className={leaveThClass('left', 'w-[22%]')}>Requested</th>
              <th className={leaveThClass('left', 'w-[28%]')}>Status</th>
              <th className={leaveThClass('right', 'w-[20%]')}>Actions</th>
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
                <td className={leaveTdClass('left')}>
                  <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
                </td>
                <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
                <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
                <td className={leaveTdClass('left', 'font-normal')}>
                  <LeaveStatusPill status={row.status} />
                </td>
                <td className="px-4 py-3 text-right align-middle" onClick={(event) => event.stopPropagation()}>
                  <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}