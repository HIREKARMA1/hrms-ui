/**
 * Overtime entries table with empty state for the Overtime sub-tab.
 * Used inside OvertimeTab card content area.
 */

import { Button } from '@/components/ui/button'

import type { ItemApprovalStatus, OvertimeEntry } from '../../types/variablePay'
import { formatCurrency } from '../../utils/formatCurrency'
import { ApprovalStatusPill } from '../ApprovalStatusPill'
import { PayrollEmptyState } from '../shared/PayrollEmptyState'
import { ApproveRowButton, RejectRowButton } from '../shared/PayrollRowActions'
import { PayrollTableColGroup } from '../shared/PayrollTableColGroup'
import {
  PAYROLL_TABLE_CLASS_WIDE,
  PAYROLL_TABLE_WIDTHS,
  payrollTdClass,
  payrollThClass,
  payrollTheadClass,
  payrollTrClass,
} from '../shared/payrollTableLayout'

type OvertimeTableProps = {
  rows: OvertimeEntry[]
  nameFor: (id: string) => string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onAdd: () => void
}

export function OvertimeTable({ rows, nameFor, onApprove, onReject, onAdd }: OvertimeTableProps) {
  if (rows.length === 0) {
    return (
      <PayrollEmptyState
        message="No overtime entries for this month."
        action={<Button type="button" onClick={onAdd}>Add overtime</Button>}
      />
    )
  }

  const pending: ItemApprovalStatus = 'Pending approval'

  return (
    <table className={PAYROLL_TABLE_CLASS_WIDE}>
      <PayrollTableColGroup widths={PAYROLL_TABLE_WIDTHS.overtime} />
      <thead className={payrollTheadClass}>
        <tr>
          <th className={payrollThClass('text')}>Employee</th>
          <th className={payrollThClass('money')}>Hours</th>
          <th className={payrollThClass('money')}>Rate / hr</th>
          <th className={payrollThClass('money')}>Amount</th>
          <th className={payrollThClass('text')}>Source</th>
          <th className={payrollThClass('text')}>Status</th>
          <th className={payrollThClass('actions')}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <OvertimeRow
            key={row.id}
            row={row}
            name={nameFor(row.employeeId)}
            pending={pending}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </tbody>
    </table>
  )
}

function OvertimeRow({
  row,
  name,
  pending,
  onApprove,
  onReject,
}: {
  row: OvertimeEntry
  name: string
  pending: ItemApprovalStatus
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  return (
    <tr className={payrollTrClass}>
      <td className={payrollTdClass('text', true, 'name')} title={name}>
        {name}
      </td>
      <td className={payrollTdClass('money', false, 'secondary')}>{row.hours}</td>
      <td className={payrollTdClass('money', false, 'secondary')}>{formatCurrency(row.ratePerHour)}</td>
      <td className={payrollTdClass('money', false, 'keyMoney')}>{formatCurrency(row.amount)}</td>
      <td className={payrollTdClass('text', true, 'secondary')} title={row.source}>
        {row.source}
      </td>
      <td className={payrollTdClass('text')}>
        <ApprovalStatusPill status={row.status} />
      </td>
      <td className={payrollTdClass('actions')}>
        {row.status === pending ? (
          <div className="flex flex-wrap justify-end gap-1">
            <ApproveRowButton onClick={() => onApprove(row.id)} />
            <RejectRowButton onClick={() => void onReject(row.id)} />
          </div>
        ) : (
          <span className="text-hrms-text-muted">—</span>
        )}
      </td>
    </tr>
  )
}
