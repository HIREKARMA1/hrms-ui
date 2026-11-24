/**
 * Employee balance ledger dialog with type summary tiles and adjustment entry.
 */

import { BookOpen } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { BALANCE_TYPE_CODES } from '../../constants/leaveTypeCodes'
import { useLeave } from '../../hooks/useLeave'
import { ledgerBalanceForType } from '../../utils/calculateBalance'
import { formatDate } from '../../utils/formatDate'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
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
import { BalanceAdjustmentDialog } from './BalanceAdjustmentDialog'
import { BalanceLedgerDialogLive } from './BalanceLedgerDialogLive'

type BalanceLedgerDialogProps = {
  open: boolean
  employeeId: string | null
  onOpenChange: (open: boolean) => void
}

export function BalanceLedgerDialog({ open, employeeId, onOpenChange }: BalanceLedgerDialogProps) {
  const { snapshot } = useLeave()
  const { showToast } = useLeaveToast()
  const [adjustOpen, setAdjustOpen] = useState(false)
  const permissions = useLeavePermissions()
  if (!snapshot || !employeeId) return null
  const employee = snapshot.employees.find((item) => item.id === employeeId)

  if (snapshot.api) {
    return (
      <BalanceLedgerDialogLive
        open={open}
        employeeId={employeeId}
        employeeName={employee?.name ?? 'Employee'}
        leaveTypes={snapshot.api.leaveTypes}
        onOpenChange={onOpenChange}
      />
    )
  }

  const ledger = snapshot.ledger.filter((item) => item.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
        <LeaveDialogContent size="lg">
          <LeaveDialogHeader title={`${employee?.name ?? 'Employee'} — ledger`} subtitle="Append-only balance history" icon={BookOpen} />
          <LeaveDialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {BALANCE_TYPE_CODES.map((code) => (
                <div key={code} className="rounded-xl bg-hrms-muted-bg px-3 py-2 text-center text-xs">
                  <p className="font-semibold text-hrms-navy">{code}</p>
                  <p className="tabular-nums text-hrms-text-secondary">{ledgerBalanceForType(snapshot.ledger, employeeId, code)}</p>
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
                {ledger.map((row) => (
                  <tr key={row.id} className="border-b border-hrms-border/40">
                    <td className="whitespace-nowrap px-2 py-2">{formatDate(row.date)}</td>
                    <td className="px-2 py-2">{row.leaveTypeCode}</td>
                    <td className="px-2 py-2">
                      <LeaveStatusPill status={row.kind} />
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.days > 0 ? `+${row.days}` : row.days}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{row.balanceAfter}</td>
                    <td className="px-2 py-2">{row.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </LeaveDialogBody>
          {permissions.canAdjustBalance ? (
            <LeaveDialogFooter>
              <Button type="button" size="sm" onClick={() => setAdjustOpen(true)}>
                Add adjustment
              </Button>
            </LeaveDialogFooter>
          ) : null}
          <LeaveDialogCloseButton />
        </LeaveDialogContent>
      </LeaveDialogRoot>
      <BalanceAdjustmentDialog open={adjustOpen && permissions.canAdjustBalance} onOpenChange={setAdjustOpen} onSaved={() => showToast('Adjustment saved (demo).')} />
    </>
  )
}