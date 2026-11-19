/**
 * Employee balance ledger dialog with type summary tiles and adjustment entry.
 */

import { BookOpen } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveHistoryQuery } from '../../api/leaveApi'
import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { useLeave } from '../../hooks/useLeave'
import { useLeaveEmployeeIdForApi } from '../../hooks/useLeaveEmployeeIdForApi'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { useShouldFetchLeaveList } from '../../hooks/useShouldFetchLeaveList'
import type { LedgerEntry } from '../../types/ledger'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { formatDate } from '../../utils/formatDate'
import { mapApiLeaveHistoryToLedger } from '../../utils/mapApiLeaveHistory'
import { leaveTodayIso } from '../../utils/leaveToday'
import { LeaveStatusPill } from '../LeaveStatusPill'
import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { AssignedLeavePoliciesLiveBlock } from './AssignedLeavePoliciesLiveBlock'
import { BalanceAdjustmentDialog } from './BalanceAdjustmentDialog'

type BalanceLedgerDialogProps = {
  open: boolean
  employeeId: string | null
  onOpenChange: (open: boolean) => void
}

export function BalanceLedgerDialog({ open, employeeId, onOpenChange }: BalanceLedgerDialogProps) {
  const { snapshot } = useLeave()
  const { showToast } = useLeaveToast()
  const [adjustOpen, setAdjustOpen] = useState(false)

  const canFetchLeaves = useShouldFetchLeaveList()
  const apiEmployeeId = useLeaveEmployeeIdForApi(snapshot, employeeId)
  const year = Number(leaveTodayIso().slice(0, 4))
  const shouldFetchHistory = Boolean(open && canFetchLeaves && apiEmployeeId)
  const shouldFetchPolicies = shouldFetchHistory

  const {
    data: historyData,
    isError: historyIsError,
    error: historyError,
    isFetching: historyFetching,
  } = useGetLeaveHistoryQuery(
    {
      employeeId: apiEmployeeId ?? '',
      year,
      limit: 200,
    },
    { skip: !shouldFetchHistory },
  )

  const mockLedger = useMemo((): LedgerEntry[] => {
    if (!snapshot || !employeeId) return []
    return snapshot.ledger
      .filter((item) => item.employeeId === employeeId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [snapshot, employeeId])

  const ledger = useMemo((): LedgerEntry[] => {
    if (shouldFetchHistory && historyData && !historyIsError) {
      return mapApiLeaveHistoryToLedger(historyData, apiEmployeeId ?? employeeId ?? '').sort(
        (a, b) => b.date.localeCompare(a.date),
      )
    }
    return mockLedger
  }, [
    apiEmployeeId,
    employeeId,
    historyData,
    historyIsError,
    mockLedger,
    shouldFetchHistory,
  ])

  const historyErrorMessage =
    shouldFetchHistory && historyIsError
      ? getApiErrorMessage(
          historyError,
          'Unable to load ledger history. Showing demo entries.',
        )
      : null

  if (!snapshot || !employeeId) return null

  const employee = snapshot.employees.find((item) => item.id === employeeId)
  const usingApiHistory = Boolean(shouldFetchHistory && historyData && !historyIsError)
  const ledgerForBalances = usingApiHistory ? ledger : snapshot.ledger
  const balanceEmployeeKey = usingApiHistory ? (apiEmployeeId ?? employeeId) : employeeId

  return (
    <>
      <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
        <LeaveDialogContent size="lg">
          <LeaveDialogHeader
            title={`${employee?.name ?? 'Employee'} — ledger`}
            subtitle="Append-only balance history"
            icon={BookOpen}
          />
          <LeaveDialogBody className="space-y-4">
            {apiEmployeeId ? (
              <AssignedLeavePoliciesLiveBlock
                employeeId={apiEmployeeId}
                year={year}
                enabled={shouldFetchPolicies}
              />
            ) : null}
            {historyErrorMessage ? (
              <p
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
                role="alert"
              >
                {historyErrorMessage}
              </p>
            ) : null}
            {historyFetching && shouldFetchHistory ? (
              <p className="text-xs text-hrms-text-muted">Loading ledger from server…</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {BALANCE_TYPE_CODES.map((code) => (
                <div key={code} className="rounded-xl bg-hrms-muted-bg px-3 py-2 text-center text-xs">
                  <p className="font-semibold text-hrms-navy">{code}</p>
                  <p className="tabular-nums text-hrms-text-secondary">
                    {ledgerBalanceForType(ledgerForBalances, balanceEmployeeKey, code)}
                  </p>
                </div>
              ))}
            </div>
            <table className="w-full table-fixed text-left text-xs">
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  {['Date', 'Type', 'Kind', 'Days', 'Balance', 'By'].map((head) => (
                    <th key={head} className="px-2 py-2 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-6 text-center text-hrms-text-muted">
                      No ledger entries for this employee.
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr key={row.id} className="border-b border-hrms-border/40">
                      <td className="whitespace-nowrap px-2 py-2">{formatDate(row.date)}</td>
                      <td className="px-2 py-2">{row.leaveTypeCode}</td>
                      <td className="px-2 py-2">
                        <LeaveStatusPill status={row.kind} />
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {row.days > 0 ? `+${row.days}` : row.days}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.balanceAfter}</td>
                      <td className="px-2 py-2">{row.by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </LeaveDialogBody>
          <LeaveDialogFooter>
            <Button type="button" size="sm" onClick={() => setAdjustOpen(true)}>
              Add adjustment
            </Button>
          </LeaveDialogFooter>
          <LeaveDialogCloseButton />
        </LeaveDialogContent>
      </LeaveDialogRoot>
      <BalanceAdjustmentDialog open={adjustOpen} onOpenChange={setAdjustOpen} onSaved={() => showToast('Adjustment saved (demo).')} />
    </>
  )
}