/**
 * Per-employee ledger and adjustment entry sheet on Balances tab.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { useLeave } from '../../hooks/useLeave'
import { formatDate } from '../../utils/formatDate'
import { LeaveStatusPill } from '../LeaveStatusPill'

type BalanceDetailSheetProps = {
  open: boolean
  employeeId: string | null
  onOpenChange: (open: boolean) => void
}

export function BalanceDetailSheet({ open, employeeId, onOpenChange }: BalanceDetailSheetProps) {
  const { snapshot } = useLeave()
  if (!snapshot || !employeeId) {
    return null
  }
  const employee = snapshot.employees.find((item) => item.id === employeeId)
  const ledger = snapshot.ledger
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{employee?.name ?? 'Employee'} — ledger</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-hrms-text-secondary">
                {['Date', 'Type', 'Kind', 'Days', 'Balance', 'By'].map((head) => (
                  <th key={head} className="pb-2 pr-2 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.map((row) => (
                <tr key={row.id} className="border-t border-hrms-border/60">
                  <td className="py-2 pr-2">{formatDate(row.date)}</td>
                  <td className="py-2 pr-2">{row.leaveTypeCode}</td>
                  <td className="py-2 pr-2">
                    <LeaveStatusPill status={row.kind} />
                  </td>
                  <td className="py-2 pr-2 tabular-nums">{row.days > 0 ? `+${row.days}` : row.days}</td>
                  <td className="py-2 pr-2 tabular-nums">{row.balanceAfter}</td>
                  <td className="py-2">{row.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-hrms-text-muted">
            Add adjustment (type, days, kind, reason) creates a new ledger row; entries are never edited or deleted.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
