import type { HrOverviewBalanceTableRow } from '../types/api/employeeLeavePolicyHrOverview.types'
import type { LeaveEmployee } from '../types/employee'

export type HrOverviewBalanceDisplayRow = HrOverviewBalanceTableRow & {
  displayName: string
  displayCode?: string
}

/** Prefer snapshot name/department when API overview is sparse (code-only, missing dept). */
export function enrichHrOverviewBalanceTableRows(
  rows: HrOverviewBalanceTableRow[],
  employees: LeaveEmployee[],
): HrOverviewBalanceDisplayRow[] {
  const byId = new Map(employees.map((employee) => [employee.id, employee]))

  return rows.map((row) => {
    const snapshot = byId.get(row.employeeId)
    const code = row.employeeCode?.trim() ?? ''
    const apiName = row.employeeName.trim()

    let displayName = apiName
    if (snapshot?.name?.trim()) {
      displayName = snapshot.name.trim()
    }

    const displayCode = code && displayName.toUpperCase() !== code.toUpperCase() ? code : undefined

    let departmentName = row.departmentName
    if (departmentName === '—' && snapshot?.department?.trim()) {
      departmentName = snapshot.department.trim()
    }

    return { ...row, displayName, displayCode, departmentName }
  })
}