import type { ApiEmployeeLeaveBalanceRow } from '../types/api/leaveBalance.types'
import type {
  ApiEmployeeLeavePolicyHrOverviewItem,
  EmployeeLeavePolicyHrOverviewData,
  HrOverviewBalanceTableRow,
} from '../types/api/employeeLeavePolicyHrOverview.types'

function resolveEmployeeId(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  return (item.employee?.id ?? item.employeeId ?? item.id ?? '').trim()
}

function resolveEmployeeName(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  const direct = item.employeeName?.trim()
  if (direct) return direct
  const employee = item.employee
  if (!employee) return item.employeeCode?.trim() || 'Unknown employee'
  const full = employee.fullName?.trim()
  if (full) return full
  const parts = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim()
  if (parts) return parts
  return employee.employeeCode?.trim() || employee.code?.trim() || 'Unknown employee'
}

function resolveDepartment(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  const dept =
    item.departmentName?.trim() ||
    item.department?.trim() ||
    item.employee?.departmentName?.trim() ||
    item.employee?.department?.trim()
  return dept || '—'
}

function resolveTypeCode(row: ApiEmployeeLeaveBalanceRow): string {
  return (row.leaveType?.code ?? row.leaveTypeCode ?? '').trim().toUpperCase()
}

function availableFromBalanceRow(row: ApiEmployeeLeaveBalanceRow): number {
  if (typeof row.available === 'number') return row.available
  if (typeof row.entitled === 'number') return row.entitled
  return 0
}

function balancesFromRecord(record: Record<string, number> | undefined): Record<string, number> {
  if (!record || typeof record !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(record)) {
    const code = key.trim().toUpperCase()
    if (!code) continue
    if (typeof value === 'number') {
      out[code] = value
      continue
    }
    if (value && typeof value === 'object' && 'available' in value) {
      const available = (value as { available?: number }).available
      if (typeof available === 'number') out[code] = available
    }
  }
  return out
}

function balancesFromItem(item: ApiEmployeeLeavePolicyHrOverviewItem): Record<string, number> {
  const fromRecord = balancesFromRecord(item.balanceByType)
  if (Object.keys(fromRecord).length > 0) return fromRecord

  const rows = item.balances ?? item.leaveBalances ?? []
  const out: Record<string, number> = {}
  for (const row of rows) {
    const code = resolveTypeCode(row)
    if (!code) continue
    out[code] = availableFromBalanceRow(row)
  }
  return out
}

export function mapApiHrOverviewItemToTableRow(
  item: ApiEmployeeLeavePolicyHrOverviewItem,
): HrOverviewBalanceTableRow | null {
  const employeeId = resolveEmployeeId(item)
  if (!employeeId) return null
  return {
    employeeId,
    employeeName: resolveEmployeeName(item),
    departmentName: resolveDepartment(item),
    balancesByCode: balancesFromItem(item),
  }
}

export function mapApiEmployeeLeavePolicyHrOverviewToTableRows(
  data: EmployeeLeavePolicyHrOverviewData,
): HrOverviewBalanceTableRow[] {
  return data.items
    .map(mapApiHrOverviewItemToTableRow)
    .filter((row): row is HrOverviewBalanceTableRow => row !== null)
}

/** Union of leave type codes across rows, stable sort (API codes as returned, then alpha). */
export function collectHrOverviewBalanceTypeCodes(rows: HrOverviewBalanceTableRow[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    for (const code of Object.keys(row.balancesByCode)) {
      set.add(code)
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}