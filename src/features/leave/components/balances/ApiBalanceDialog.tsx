/**
 * One employee's server leave balances (GET /leaves/balance/:employeeId?year).
 */

import { BookOpen } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { getLeaveErrorMessage, useGetLeaveBalanceQuery } from '../../api/leaveApi'
import { mapLeaveBalanceRows, type LeaveTypeOption } from '../../api/leaveMappers'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveInlineLoading } from '../shared/LeaveServerNotice'
import { LEAVE_DIALOG_SELECT, LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { useEmployeeLeavePolicyActions } from '../../hooks/useEmployeeLeavePolicyActions'
import { buildAssignEmployeeLeaveDefaultsBody } from '../../utils/buildEmployeeLeavePolicyBody'
import { AssignedLeavePoliciesLiveBlock } from '../dialogs/AssignedLeavePoliciesLiveBlock'
import { EmployeeLeaveHistorySection } from '../history/EmployeeLeaveHistorySection'
import { ApiAssignEmployeeLeavePolicyDialog } from './ApiAssignEmployeeLeavePolicyDialog'
import { ApiBalanceAdjustmentDialog } from './ApiBalanceAdjustmentDialog'

type ApiBalanceDialogProps = {
  employeeId: string | null
  employeeName: string
  currentYear: number
  leaveTypes: LeaveTypeOption[]
  onOpenChange: (open: boolean) => void
}

export function ApiBalanceDialog({ employeeId, employeeName, currentYear, leaveTypes, onOpenChange }: ApiBalanceDialogProps) {
  const permissions = useLeavePermissions()
  const { showToast } = useLeaveToast()
  const [year, setYear] = useState(currentYear)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assigningDefaults, setAssigningDefaults] = useState(false)
  const policyActions = useEmployeeLeavePolicyActions()
  const balance = useGetLeaveBalanceQuery({ employeeId: employeeId ?? '', year }, { skip: !employeeId })
  const rows = useMemo(() => (balance.data ? mapLeaveBalanceRows(balance.data, leaveTypes) : []), [balance.data, leaveTypes])

  if (!employeeId) return null
  const resolvedEmployeeId = employeeId

  async function assignAllDefaults() {
    const built = buildAssignEmployeeLeaveDefaultsBody({ employeeId: resolvedEmployeeId, year })
    if (!built.ok) {
      showToast(built.error)
      return
    }
    setAssigningDefaults(true)
    const result = await policyActions.assignDefaults(built.body)
    setAssigningDefaults(false)
    showToast(result.ok ? 'Company defaults assigned for this employee.' : result.message)
  }

  const canManagePolicies = permissions.canAdjustBalance

  return (
    <>
      <LeaveDialogRoot open onOpenChange={onOpenChange}>
        <LeaveDialogContent size="lg">
          <LeaveDialogHeader title={`${employeeName} — balances`} subtitle="Allocated, used, pending and available days from the server." icon={BookOpen} />
          <LeaveDialogBody className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-hrms-text-secondary" htmlFor="api-balance-year">
              Year
              <select id="api-balance-year" className={cn(LEAVE_DIALOG_SELECT, 'w-auto')} value={year} onChange={(e) => setYear(Number(e.target.value))}>
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
              <LeaveErrorState message={getLeaveErrorMessage(balance.error, 'Could not load balances.')} onRetry={() => void balance.refetch()} />
            ) : rows.length === 0 ? (
              <LeaveEmptyState message={`No leave balances are recorded for ${year}.`} />
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
            <AssignedLeavePoliciesLiveBlock employeeId={employeeId} year={year} enabled />
            <EmployeeLeaveHistorySection employeeId={employeeId} enabled year={year} title="Leave requests" />
          </LeaveDialogBody>
          {canManagePolicies ? (
            <LeaveDialogFooter>
              <div className="flex w-full flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={assigningDefaults}
                  onClick={() => void assignAllDefaults()}
                >
                  Assign all defaults
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setAssignOpen(true)} disabled={leaveTypes.length === 0}>
                  Assign policy
                </Button>
                <Button type="button" size="sm" onClick={() => setAdjustOpen(true)} disabled={leaveTypes.length === 0}>
                  Add adjustment
                </Button>
              </div>
            </LeaveDialogFooter>
          ) : null}
          <LeaveDialogCloseButton />
        </LeaveDialogContent>
      </LeaveDialogRoot>
      {adjustOpen && canManagePolicies ? (
        <ApiBalanceAdjustmentDialog
          open
          onOpenChange={setAdjustOpen}
          employeeId={employeeId}
          employeeName={employeeName}
          year={year}
          leaveTypes={leaveTypes}
          onSaved={showToast}
        />
      ) : null}
      {assignOpen && canManagePolicies ? (
        <ApiAssignEmployeeLeavePolicyDialog
          open
          onOpenChange={setAssignOpen}
          employeeId={employeeId}
          employeeName={employeeName}
          year={year}
          leaveTypes={leaveTypes}
          onSaved={showToast}
        />
      ) : null}
    </>
  )
}
