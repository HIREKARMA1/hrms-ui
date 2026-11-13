/**
 * Compact payslip summary: net pay, payment line, View details, Download PDF.
 */

import { Download, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { EmployeeWithComputed } from '../../types/payroll'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { formatMonth } from '../../utils/formatMonth'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import { StatusPill } from '../StatusPill'
import { PAYROLL_SECONDARY_BUTTON } from '../shared/payrollUi'

type MyPayslipSummaryCardProps = {
  employee: EmployeeWithComputed
  payrollMonth: string
  onViewDetails: () => void
}

export function MyPayslipSummaryCard({ employee, payrollMonth, onViewDetails }: MyPayslipSummaryCardProps) {
  const { showToast } = usePayrollToast()
  const monthLabel = formatMonth(payrollMonth)

  const paymentLine = [
    employee.paymentMode,
    employee.referenceNumber,
    employee.paidOn ? `Paid ${formatDate(employee.paidOn)}` : 'Payment pending',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card className="overflow-hidden border-hrms-border shadow-sm">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-hrms-lavender/50 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-md bg-hrms-muted-bg px-2 py-0.5 text-xs font-semibold text-hrms-navy">
                {monthLabel}
              </span>
              <p className="mt-2 text-base font-semibold text-hrms-navy">{employee.name}</p>
              <p className="text-sm text-hrms-text-muted">
                {employee.id} · {employee.department}
              </p>
            </div>
            <StatusPill status={employee.status} />
          </div>
          <p className="mt-5 text-3xl font-bold tabular-nums tracking-tight text-hrms-primary">
            {formatCurrency(employee.netPay)}
          </p>
          <p className="mt-1 text-sm font-medium text-hrms-text-secondary">Net pay credited</p>
          <p className="mt-2 text-sm text-hrms-text-muted">{paymentLine}</p>
        </div>
        <div className="flex flex-col gap-2 border-t border-hrms-border bg-hrms-page/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" className="gap-2 sm:min-w-[9.5rem]" onClick={onViewDetails}>
            <Eye className="h-4 w-4" aria-hidden />
            View details
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(PAYROLL_SECONDARY_BUTTON, 'gap-2 sm:min-w-[9.5rem]')}
            onClick={() => showToast('PDF download will be available with the API.')}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
