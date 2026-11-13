/**
 * Employees active in the selected payroll month (excludes exited).
 * Used by Overview data, overtime, incentive, and bonus pickers.
 */

import { useMemo } from 'react'

import { filterEmployeesForPayrollMonth } from '../utils/employeeExit'
import { usePayroll } from './usePayroll'

export function usePayrollActiveEmployees() {
  const { rawEmployees, settlements, payrollMonth } = usePayroll()
  return useMemo(
    () => filterEmployeesForPayrollMonth(rawEmployees, settlements, payrollMonth),
    [rawEmployees, settlements, payrollMonth],
  )
}
