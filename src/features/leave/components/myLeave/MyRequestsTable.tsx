/**
 * Filterable leave history table for the current viewer on My Leave tab.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { LeaveStatusPill } from '../LeaveStatusPill'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../../constants/leaveTypeCodes'
import type { LeaveRequest } from '../../types/leaveRequest'
import { formatDate } from '../../utils/formatDate'

type MyRequestsTableProps = {
  rows: LeaveRequest[]
  onView: (row: LeaveRequest) => void
  onCancel: (row: LeaveRequest) => void
  canCancel: (row: LeaveRequest) => boolean
}

export function MyRequestsTable({ rows, onView, onCancel, canCancel }: MyRequestsTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-hrms-text-muted">
          No leave requests match your filters.
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] table-auto text-left text-sm">
          <thead className="bg-hrms-page text-hrms-text-secondary">
            <tr>
              {['Leave type', 'From', 'To', 'Days', 'Applied on', 'Status', 'Actions'].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-hrms-border/60 hover:bg-hrms-row-hover">
                <td className="px-4 py-3">{LEAVE_TYPE_LABELS[row.leaveTypeCode as LeaveTypeCode] ?? row.leaveTypeCode}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(row.fromDate)}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(row.toDate)}</td>
                <td className="px-4 py-3 tabular-nums">{row.days}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(row.appliedOn)}</td>
                <td className="px-4 py-3">
                  <LeaveStatusPill status={row.currentStepLabel} />
                  {row.escalated ? <LeaveStatusPill status="Escalated" className="ml-1" /> : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onView(row)}>
                      View
                    </Button>
                    {canCancel(row) ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => onCancel(row)}>
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
