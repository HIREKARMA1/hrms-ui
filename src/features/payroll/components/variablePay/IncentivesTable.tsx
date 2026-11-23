/**
 * Incentive entries table with formatted month column.
 * Used inside IncentivesTab.
 */

import { Button } from '@/components/ui/button'

import type { IncentiveEntry, ItemApprovalStatus } from '../../types/variablePay'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatMonth } from '../../utils/formatMonth'
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
import { cn } from '@/lib/utils'

type IncentivesTableProps = {
  rows: IncentiveEntry[]
  nameFor: (id: string) => string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onAdd: () => void
}

export function IncentivesTable({ rows, nameFor, onApprove, onReject, onAdd }: IncentivesTableProps) {
  if (rows.length === 0) {
    return (
      <PayrollEmptyState
        message="No incentives recorded for this month."
        action={<Button type="button" onClick={onAdd}>Add incentive</Button>}
      />
    )
  }

  const pending: ItemApprovalStatus = 'Pending approval'

  return (
    <table className={PAYROLL_TABLE_CLASS_WIDE}>
      <PayrollTableColGroup widths={PAYROLL_TABLE_WIDTHS.incentives} />
      <thead className={payrollTheadClass}>
        <tr>
          <th className={payrollThClass('text')}>Employee</th>
          <th className={payrollThClass('text')}>Type</th>
          <th className={payrollThClass('text')}>Month</th>
          <th className={payrollThClass('money')}>Amount</th>
          <th className={payrollThClass('text')}>Note</th>
          <th className={payrollThClass('text')}>Status</th>
          <th className={payrollThClass('actions')}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={payrollTrClass}>
            <td className={payrollTdClass('text', true, 'name')} title={nameFor(row.employeeId)}>
              {nameFor(row.employeeId)}
            </td>
            <td className={payrollTdClass('text', true)} title={row.incentiveType}>
              {row.incentiveType}
            </td>
            <td className={payrollTdClass('text', false, 'secondary')}>{formatMonth(row.payrollMonth)}</td>
            <td className={payrollTdClass('money', false, 'keyMoney')}>{formatCurrency(row.amount)}</td>
            <td className={cn(payrollTdClass('text', true, 'secondary'), 'text-hrms-text-secondary')} title={row.note ?? '—'}>
              {row.note ?? '—'}
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
        ))}
      </tbody>
    </table>
  )
}
