/**
 * Single row for HrEncashmentRequestsTable.
 */

import type { HrEncashmentRequestRow } from '../../types/api/leaveEncashmentList.types'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LeaveTypeChip } from '../LeaveTypeChip'
import { ApproveRowButton, RejectRowButton, RowLinkButton } from '../shared/LeaveRowActions'
import { LEAVE_TABLE_ROW } from '../shared/leaveUi'
import { leaveTdClass } from '../shared/leaveTableLayout'

type RowProps = {
  row: HrEncashmentRequestRow
  label: string
  showActions: boolean
  showReview: boolean
  canApprove: boolean
  canReject: boolean
  busyId: string | null
  onView?: (row: HrEncashmentRequestRow) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function HrEncashmentRequestTableRow({
  row,
  label,
  showActions,
  showReview,
  canApprove,
  canReject,
  busyId,
  onView,
  onApprove,
  onReject,
}: RowProps) {
  const pending = row.status === 'Pending approval'

  return (
    <tr
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
        <span className="font-medium text-hrms-navy">{label}</span>
      </td>
      <td className={leaveTdClass('left', 'font-normal')}>
        <LeaveTypeChip code={row.leaveTypeCode} abbreviated />
      </td>
      <td className={leaveTdClass('right', 'font-normal')}>{row.days}</td>
      <td className={leaveTdClass('left', 'font-normal')}>{formatDate(row.appliedOn)}</td>
      <td className={leaveTdClass('left', 'font-normal')}>
        <LeaveStatusPill status={row.status} />
      </td>
      {showActions ? (
        <td className="px-4 py-3 text-right align-middle" onClick={(event) => event.stopPropagation()}>
          <div className="flex flex-nowrap items-center justify-end gap-2">
            {onView ? <RowLinkButton onClick={() => onView(row)}>View</RowLinkButton> : null}
            {pending && showReview ? (
              <>
                {canApprove ? (
                  <ApproveRowButton disabled={busyId === row.id} onClick={() => onApprove?.(row.id)} />
                ) : null}
                {canReject ? (
                  <RejectRowButton disabled={busyId === row.id} onClick={() => onReject?.(row.id)} />
                ) : null}
              </>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  )
}

export function hrEncashmentEmployeeLabel(
  row: HrEncashmentRequestRow,
  employeeName: (id: string) => string,
): string {
  return row.employeeDisplayName ?? (employeeName(row.employeeId) || row.employeeId || '—')
}