/**
 * Payment mode, UTR, and paid date for employee payslip view.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { EmployeeWithComputed } from '../../types/payroll'
import { formatDate } from '../../utils/formatDate'
import { StatusPill } from '../StatusPill'

type PayslipPaymentCardProps = {
  employee: EmployeeWithComputed
}

export function PayslipPaymentCard({ employee }: PayslipPaymentCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-hrms-navy">Payment details</CardTitle>
        <StatusPill status={employee.status} />
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-hrms-text-muted">Mode</p>
          <p className="font-medium text-hrms-navy">{employee.paymentMode ?? '—'}</p>
        </div>
        <div>
          <p className="text-hrms-text-muted">Reference</p>
          <p className="font-medium tabular-nums text-hrms-navy">{employee.referenceNumber ?? '—'}</p>
        </div>
        <div>
          <p className="text-hrms-text-muted">Paid on</p>
          <p className="font-medium text-hrms-navy">
            {employee.paidOn ? formatDate(employee.paidOn) : 'Not paid yet'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
