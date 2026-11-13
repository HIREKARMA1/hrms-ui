/**
 * Static mock payroll employee records for UI development.
 * Used only by payrollService until a real API is connected.
 */

import { mockPayrollEmployeesPartA } from './mockPayrollEmployeesPartA'
import { mockPayrollEmployeesPartB } from './mockPayrollEmployeesPartB'

export const mockPayrollEmployees = [
  ...mockPayrollEmployeesPartA,
  ...mockPayrollEmployeesPartB,
]
