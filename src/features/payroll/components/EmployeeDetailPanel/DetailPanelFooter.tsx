/**
 * Status-specific action buttons in the employee detail panel footer.
 * Used by EmployeeDetailPanel.
 */

import { Button } from '@/components/ui/button'

import { usePayroll } from '../../hooks/usePayroll'
import { usePayrollToast } from '../../hooks/usePayrollToast'
import type { EmployeeWithComputed } from '../../types/payroll'

type DetailPanelFooterProps = {
  employee: EmployeeWithComputed
}

export function DetailPanelFooter({ employee }: DetailPanelFooterProps) {
  const { markAsPaid, holdSalary, retryPayment, releaseSalary } = usePayroll()
  const { showToast } = usePayrollToast()

  if (employee.status === 'Pending') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => {
            markAsPaid(employee.id)
            showToast(`${employee.name} marked as paid.`)
          }}
        >
          Mark as paid
        </Button>
        <Button type="button" variant="outline" onClick={() => holdSalary(employee.id)}>
          Hold salary
        </Button>
      </div>
    )
  }

  if (employee.status === 'Failed') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => retryPayment(employee.id)}>
          Retry payment
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => showToast('Bank details editor will open with the API.')}
        >
          Edit bank details
        </Button>
      </div>
    )
  }

  if (employee.status === 'On Hold') {
    return (
      <Button type="button" onClick={() => releaseSalary(employee.id)}>
        Release salary
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => showToast('PDF download will be available with the API.')}
    >
      Download payslip
    </Button>
  )
}
