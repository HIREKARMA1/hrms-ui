/**

 * Payslip preview with download and email actions (toast only).

 * Used inside EmployeeDetailPanel.

 */



import { Button } from '@/components/ui/button'



import { usePayrollToast } from '../../../hooks/usePayrollToast'

import type { EmployeeWithComputed } from '../../../types/payroll'

import { formatCurrency } from '../../../utils/formatCurrency'

import { formatDate } from '../../../utils/formatDate'



type PayslipTabProps = {

  employee: EmployeeWithComputed

}



export function PayslipTab({ employee }: PayslipTabProps) {

  const { showToast } = usePayrollToast()



  return (

    <div className="space-y-5 text-sm">

      <div className="rounded-xl border border-hrms-border bg-hrms-page p-4">

        <p className="text-lg font-bold text-hrms-navy">{employee.name}</p>

        <p className="text-hrms-text-muted">

          {employee.id} · {employee.department}

        </p>

        <p className="mt-4 text-2xl font-bold tabular-nums text-hrms-primary">

          {formatCurrency(employee.netPay)}

        </p>

        <p className="text-hrms-text-secondary">Net pay for Nov 2026</p>

        <p className="mt-2 text-xs text-hrms-text-muted">

          Generated on {formatDate(employee.paidOn ?? new Date().toISOString())}

        </p>

      </div>

      <div className="flex flex-wrap gap-2">

        <Button

          type="button"

          variant="outline"

          onClick={() => showToast('PDF download will be available with the API.')}

        >

          Download PDF

        </Button>

        <Button

          type="button"

          variant="outline"

          onClick={() => showToast('Payslip email will be sent when integrated.')}

        >

          Email payslip

        </Button>

      </div>

    </div>

  )

}


