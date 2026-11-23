/**
 * Payslip preview inside HR employee detail panel (reuses employee My Payslip layout).
 */

import { usePayroll } from '../../../hooks/usePayroll'
import type { EmployeeWithComputed } from '../../../types/payroll'
import { MyPayslipView } from '../../myPayslips/MyPayslipView'

type PayslipTabProps = {
  employee: EmployeeWithComputed
}

export function PayslipTab({ employee }: PayslipTabProps) {
  const { payrollMonth } = usePayroll()
  return <MyPayslipView employee={employee} payrollMonth={payrollMonth} />
}
