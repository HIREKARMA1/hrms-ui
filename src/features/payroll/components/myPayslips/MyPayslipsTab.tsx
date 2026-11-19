/**
 * Employee payroll view: current-month payslip for the viewer's employee record.
 */

import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'
import { LeaveEmployeeLinkNotice } from '@/features/leave/components/shared/LeaveEmployeeLinkNotice'
import { LeaveEmptyState } from '@/features/leave/components/shared/LeaveEmptyState'

import { usePayroll } from '../../hooks/usePayroll'
import { PayrollTabHeader } from '../shared/PayrollTabHeader'
import { MyPayslipView } from './MyPayslipView'

export function MyPayslipsTab() {
  const { employees, payrollMonth } = usePayroll()
  const { viewer } = useLeaveViewer()
  const employee = viewer.employeeId
    ? employees.find((item) => item.id === viewer.employeeId)
    : undefined

  return (
    <div className="space-y-6">
      <PayrollTabHeader
        title="My payslips"
        payrollMonth={payrollMonth}
        subtitle="Your net pay and payment for the selected month. Open details for the full breakdown."
      />
      {employee ? (
        <MyPayslipView employee={employee} payrollMonth={payrollMonth} />
      ) : !viewer.employeeId ? (
        <div className="mx-auto max-w-3xl">
          <LeaveEmployeeLinkNotice what="your payslips" />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <LeaveEmptyState message="No payroll record for your demo employee in this month." />
        </div>
      )}
    </div>
  )
}
