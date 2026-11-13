/**
 * Bonus runs data table with payout month formatting and row actions.
 * Used inside BonusTab card content.
 */

import { Button } from '@/components/ui/button'

import type { BonusRun } from '../../types/variablePay'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatMonth } from '../../utils/formatMonth'
import { ApprovalStatusPill } from '../ApprovalStatusPill'
import { PayrollEmptyState } from '../shared/PayrollEmptyState'
import { ApproveRowButton } from '../shared/PayrollRowActions'
import { PayrollTableColGroup } from '../shared/PayrollTableColGroup'
import {
  PAYROLL_TABLE_CLASS,
  PAYROLL_TABLE_WIDTHS,
  payrollTdClass,
  payrollThClass,
  payrollTheadClass,
  payrollTrClass,
} from '../shared/payrollTableLayout'

type BonusRunsTableProps = {
  rows: BonusRun[]
  onApprove: (id: string) => void
  onMarkPaid: (id: string) => void
  onNew: () => void
}

export function BonusRunsTable({ rows, onApprove, onMarkPaid, onNew }: BonusRunsTableProps) {
  if (rows.length === 0) {
    return (
      <PayrollEmptyState
        message="No bonus runs for this payout month."
        action={<Button type="button" onClick={onNew}>New bonus run</Button>}
      />
    )
  }

  return (
    <table className={PAYROLL_TABLE_CLASS}>
      <PayrollTableColGroup widths={PAYROLL_TABLE_WIDTHS.bonusRuns} />
      <thead className={payrollTheadClass}>
        <tr>
          <th className={payrollThClass('text')}>Type</th>
          <th className={payrollThClass('text')}>Period</th>
          <th className={payrollThClass('text')}>Payout month</th>
          <th className={payrollThClass('money')}>Amount</th>
          <th className={payrollThClass('text')}>Status</th>
          <th className={payrollThClass('actions')}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((run) => {
          const amount = run.lines.filter((line) => line.included).reduce((sum, line) => sum + line.amount, 0)
          return (
            <tr key={run.id} className={payrollTrClass}>
              <td className={payrollTdClass('text', true, 'name')} title={run.bonusType}>
                {run.bonusType}
              </td>
              <td className={payrollTdClass('text', true, 'secondary')} title={run.periodLabel}>
                {run.periodLabel}
              </td>
              <td className={payrollTdClass('text', false, 'secondary')}>{formatMonth(run.payoutMonth)}</td>
              <td className={payrollTdClass('money', false, 'keyMoney')}>{formatCurrency(amount)}</td>
              <td className={payrollTdClass('text')}>
                <ApprovalStatusPill status={run.status} />
              </td>
              <td className={payrollTdClass('actions')}>
                {run.status === 'Draft' ? (
                  <ApproveRowButton onClick={() => onApprove(run.id)} />
                ) : run.status === 'Approved' ? (
                  <ApproveRowButton onClick={() => onMarkPaid(run.id)}>Mark paid</ApproveRowButton>
                ) : (
                  <span className="text-hrms-text-muted">—</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
