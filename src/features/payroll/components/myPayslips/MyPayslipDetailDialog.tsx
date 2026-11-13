/**
 * Full payslip breakdown in a dialog (opened from View details).
 */

import { Download } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { EmployeeWithComputed } from '../../types/payroll'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatMonth } from '../../utils/formatMonth'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import { EmployeePayrollBreakdown } from '../shared/EmployeePayrollBreakdown'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '../shared/PayrollDialog'
import { PAYROLL_SECONDARY_BUTTON } from '../shared/payrollUi'
import { PayslipPaymentCard } from './PayslipPaymentCard'

type MyPayslipDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeWithComputed
  payrollMonth: string
}

export function MyPayslipDetailDialog({
  open,
  onOpenChange,
  employee,
  payrollMonth,
}: MyPayslipDetailDialogProps) {
  const { showToast } = usePayrollToast()
  const monthLabel = formatMonth(payrollMonth)

  return (
    <PayrollDialogRoot open={open} onOpenChange={onOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent size="md" className="flex max-h-[min(90vh,720px)] flex-col p-0">
          <PayrollDialogHeader
            title="Payslip details"
            description={`${employee.name} · ${monthLabel}`}
          />
          <PayrollDialogBody>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-hrms-muted-bg/80 p-3 text-center sm:gap-3 sm:p-4">
              <AmountTile label="Gross" value={formatCurrency(employee.gross)} />
              <AmountTile label="Deductions" value={formatCurrency(employee.totalDeductions)} tone="danger" />
              <AmountTile label="Net pay" value={formatCurrency(employee.netPay)} tone="primary" />
            </div>
            <PayslipPaymentCard employee={employee} />
            <PayslipBreakdownSection title="Salary breakdown">
              <EmployeePayrollBreakdown employee={employee} />
            </PayslipBreakdownSection>
          </PayrollDialogBody>
          <PayrollDialogFooter>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className={cn(PAYROLL_SECONDARY_BUTTON, 'gap-2')}
                onClick={() => showToast('PDF download will be available with the API.')}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download PDF
              </Button>
            </div>
          </PayrollDialogFooter>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}

function AmountTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'danger' | 'primary'
}) {
  return (
    <div className="min-w-0 rounded-lg bg-white px-2 py-2 sm:px-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-hrms-text-muted sm:text-xs">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm font-bold tabular-nums sm:text-base',
          tone === 'danger' && 'text-hrms-danger',
          tone === 'primary' && 'text-hrms-primary',
          tone === 'neutral' && 'text-hrms-navy',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PayslipBreakdownSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-hrms-navy">{title}</h3>
      {children}
    </section>
  )
}
