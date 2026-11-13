/**
 * Settlements list table with formatted dates and actions column.
 * Used by FinalSettlementTab inside the settlements card.
 */

import { Button } from '@/components/ui/button'

import type { FinalSettlement } from '../../types/finalSettlement'
import { formatDate } from '../../utils/formatDate'
import { finalSettlementDay } from '../../utils/noticeDays'
import { formatCurrency } from '../../utils/formatCurrency'
import { ApprovalStatusPill } from '../ApprovalStatusPill'
import { PayrollEmptyState } from '../shared/PayrollEmptyState'
import { RowLinkButton } from '../shared/PayrollRowActions'
import { PayrollTableColGroup } from '../shared/PayrollTableColGroup'
import {
  PAYROLL_TABLE_CLASS,
  PAYROLL_TABLE_WIDTHS,
  payrollTdClass,
  payrollThClass,
  payrollTheadClass,
  payrollTrClass,
} from '../shared/payrollTableLayout'

type FinalSettlementTableProps = {
  rows: FinalSettlement[]
  nameFor: (id: string) => string
  onOpen: (row: FinalSettlement) => void
  onNew: () => void
}

export function FinalSettlementTable({ rows, nameFor, onOpen, onNew }: FinalSettlementTableProps) {
  if (rows.length === 0) {
    return (
      <PayrollEmptyState
        message="No settlements match your filters."
        action={<Button type="button" onClick={onNew}>New settlement</Button>}
      />
    )
  }

  return (
    <table className={PAYROLL_TABLE_CLASS}>
      <PayrollTableColGroup widths={PAYROLL_TABLE_WIDTHS.finalSettlement} />
      <thead className={payrollTheadClass}>
        <tr>
          <th className={payrollThClass('text')}>Employee</th>
          <th className={payrollThClass('text')}>Last working day</th>
          <th className={payrollThClass('text')}>Final settlement day</th>
          <th className={payrollThClass('money')}>Net payable</th>
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
            <td className={payrollTdClass('text', false, 'secondary')}>{formatDate(row.lastWorkingDay)}</td>
            <td className={payrollTdClass('text', false, 'secondary')}>
              {formatDate(finalSettlementDay(row.lastWorkingDay, row.noticePeriodDaysRequired))}
            </td>
            <td className={payrollTdClass('money', false, 'keyMoney')}>{formatCurrency(row.netPayable)}</td>
            <td className={payrollTdClass('text')}>
              <ApprovalStatusPill status={row.status} />
            </td>
            <td className={payrollTdClass('actions')}>
              <RowLinkButton onClick={() => onOpen(row)}>Open</RowLinkButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
