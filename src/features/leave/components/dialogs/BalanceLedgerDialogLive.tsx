/**
 * Balance + leave history from the server (GET balance + GET history).
 */
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { getLeaveErrorMessage, useGetLeaveBalanceQuery } from '../../api/leaveApi'
import { mapLeaveBalanceRows } from '../../api/leaveMappers'
import { leaveTodayIso } from '../../utils/leaveToday'
import { EmployeeLeaveHistorySection } from '../history/EmployeeLeaveHistorySection'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveInlineLoading } from '../shared/LeaveServerNotice'
import { LEAVE_DIALOG_SELECT, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import type { LeaveTypeOption } from '../../api/leaveMappers'
import { BookOpen } from 'lucide-react'

type BalanceLedgerDialogLiveProps = {
  open: boolean
  employeeId: string
  employeeName: string
  leaveTypes: LeaveTypeOption[]
  onOpenChange: (open: boolean) => void
}

export function BalanceLedgerDialogLive({
  open,
  employeeId,
  employeeName,
  leaveTypes,
  onOpenChange,
}: BalanceLedgerDialogLiveProps) {
  const currentYear = Number(leaveTodayIso().slice(0, 4))
  const [year, setYear] = useState(currentYear)
  const balance = useGetLeaveBalanceQuery({ employeeId, year }, { skip: !open })
  const rows = useMemo(() => (balance.data ? mapLeaveBalanceRows(balance.data, leaveTypes) : []), [balance.data, leaveTypes])

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="lg">
        <LeaveDialogHeader
          title={`${employeeName} — balances & history`}
          subtitle="Balances and leave requests from the live API."
          icon={BookOpen}
        />
        <LeaveDialogBody className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-hrms-text-secondary" htmlFor="ledger-balance-year">
              Year
              <select
                id="ledger-balance-year"
                className={cn(LEAVE_DIALOG_SELECT, 'w-auto')}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[currentYear, currentYear - 1].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {balance.isFetching && !balance.data ? (
              <LeaveInlineLoading label="Loading balances…" />
            ) : balance.isError && !balance.data ? (
              <LeaveErrorState
                message={getLeaveErrorMessage(balance.error, 'Could not load balances.')}
                onRetry={() => void balance.refetch()}
              />
            ) : (
              <table className="w-full table-fixed text-left text-xs">
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    <th className="px-2 py-2 font-semibold">Leave type</th>
                    {['Allocated', 'Used', 'Pending', 'Available'].map((head) => (
                      <th key={head} className="px-2 py-2 text-right font-semibold">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.leaveTypeId} className="border-b border-hrms-border/40">
                      <td className="px-2 py-2">
                        {row.leaveTypeName} <span className="text-hrms-text-muted">({row.leaveTypeCode})</span>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.allocated}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.used}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.pending}</td>
                      <td className="px-2 py-2 text-right font-semibold tabular-nums">{row.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <EmployeeLeaveHistorySection employeeId={employeeId} enabled={open} year={year} />
        </LeaveDialogBody>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}