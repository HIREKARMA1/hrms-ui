/**
 * Employee payroll view: current-month payslip for the signed-in demo user.
 */

import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'
import { LeaveEmptyState } from '@/features/leave/components/shared/LeaveEmptyState'

import { usePayroll } from '../../hooks/usePayroll'
import { PayrollTabHeader } from '../shared/PayrollTabHeader'
import { MyPayslipView } from './MyPayslipView'

export function MyPayslipsTab() {
  const { employees, payrollMonth } = usePayroll()
  const { viewer } = useLeaveViewer()
  const employee = employees.find((item) => item.id === viewer.employeeId)

  return (
    <div className="space-y-6">
      <PayrollTabHeader
        title="My payslips"
        payrollMonth={payrollMonth}
        subtitle="Your net pay and payment for the selected month. Open details for the full breakdown."
      />
      {employee ? (
        <MyPayslipView employee={employee} payrollMonth={payrollMonth} />
      ) : (
        <div className="mx-auto max-w-3xl">
          <LeaveEmptyState message="No payroll record for your demo employee in this month." />
        </div>
      )}
    </div>
  )
}
