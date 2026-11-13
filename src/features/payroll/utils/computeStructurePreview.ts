/**
 * Preview payroll numbers for a structure without payment-run fields.
 * Used by StructureLivePreview in the Structures detail panel.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { ComputedPayroll } from '../types/payroll'
import { computePayrollFields } from './calculatePayroll'

export function computeStructurePreview(
  settings: PayrollSettings,
  structure: SalaryStructure,
  payrollMonth: string,
): ComputedPayroll {
  return computePayrollFields(
    {
      id: structure.employeeId,
      name: structure.employeeName,
      department: structure.department,
      structureId: structure.id,
      joiningDate: '2020-01-01',
      incomeTax: 0,
      unpaidLeaveDays: 0,
      loanRecovery: 0,
      status: 'Pending',
    },
    settings,
    structure,
    payrollMonth,
  )
}
