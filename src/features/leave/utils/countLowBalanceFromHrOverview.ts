import { LOW_BALANCE_THRESHOLD_DAYS, LOW_BALANCE_TYPE_CODES } from '../constants/hrOverviewConstants'
import type { HrOverviewBalanceTableRow } from '../types/api/employeeLeavePolicyHrOverview.types'

/** Employees with available balance under threshold on any tracked paid leave type. */
export function countLowBalanceEmployeesFromHrOverview(
  rows: HrOverviewBalanceTableRow[],
  typeCodes: readonly string[] = LOW_BALANCE_TYPE_CODES,
): number {
  let count = 0
  for (const row of rows) {
    const low = typeCodes.some((code) => {
      const upper = code.toUpperCase()
      const value =
        row.balancesByCode[upper] ??
        row.balancesByCode[code] ??
        row.balancesByCode[code.toLowerCase()]
      return typeof value === 'number' && value < LOW_BALANCE_THRESHOLD_DAYS
    })
    if (low) count += 1
  }
  return count
}