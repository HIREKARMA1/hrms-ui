/**
 * Fetches employees, settings, structures, and variable pay for the provider.
 * Used by PayrollProvider on mount and reload.
 */

import {
  fetchBonusRuns,
  fetchFinalSettlements,
  fetchIncentiveEntries,
  fetchOvertimeEntries,
  fetchPayrollEmployees,
  getSalaryStructures,
  getSettings,
} from '../services/payrollService'

export async function loadPayrollBundle() {
  const [
    employees,
    settings,
    structures,
    overtime,
    incentives,
    bonusRuns,
    settlements,
  ] = await Promise.all([
    fetchPayrollEmployees(),
    getSettings(),
    getSalaryStructures(),
    fetchOvertimeEntries(),
    fetchIncentiveEntries(),
    fetchBonusRuns(),
    fetchFinalSettlements(),
  ])
  return { employees, settings, structures, overtime, incentives, bonusRuns, settlements }
}
