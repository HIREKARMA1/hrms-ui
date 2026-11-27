import type { ApiEmployeeLeaveBalanceRow } from '../types/api/leaveBalance.types'
import type {
  ApiEmployeeLeavePolicyHrOverviewItem,
  EmployeeLeavePolicyHrOverviewData,
  HrOverviewBalanceTableRow,
} from '../types/api/employeeLeavePolicyHrOverview.types'

function resolveEmployeeId(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  return (item.employee?.id ?? item.employeeId ?? item.id ?? '').trim()
}

function resolveEmployeeCode(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  return (item.employeeCode ?? item.employee?.employeeCode ?? item.employee?.code ?? '').trim()
}

/** Maps API `paidLeaveAvailable` / `sickLeaveAvailable` to org leave type codes. */
const HR_OVERVIEW_PAID_LEAVE_CODE = 'EARNED'
const HR_OVERVIEW_SICK_LEAVE_CODE = 'SICK'

function resolveEmployeeName(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  const direct = item.employeeName?.trim() || item.name?.trim()
  if (direct) return direct
  const employee = item.employee
  if (!employee) return item.employeeCode?.trim() || 'Unknown employee'
  const full = employee.fullName?.trim()
  if (full) return full
  const parts = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim()
  if (parts) return parts
  return employee.employeeCode?.trim() || employee.code?.trim() || 'Unknown employee'
}

function departmentLabel(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const name = record.name ?? record.title ?? record.departmentName
    if (typeof name === 'string') return name.trim()
  }
  return ''
}

function resolveDepartment(item: ApiEmployeeLeavePolicyHrOverviewItem): string {
  const dept =
    departmentLabel(item.departmentName) ||
    departmentLabel(item.department) ||
    departmentLabel(item.employee?.departmentName) ||
    departmentLabel(item.employee?.department)
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

function balancesFromSummaryFields(item: ApiEmployeeLeavePolicyHrOverviewItem): Record<string, number> {
  const out: Record<string, number> = {}
  if (typeof item.paidLeaveAvailable === 'number' && Number.isFinite(item.paidLeaveAvailable)) {
    out[HR_OVERVIEW_PAID_LEAVE_CODE] = item.paidLeaveAvailable
  }
  if (typeof item.sickLeaveAvailable === 'number' && Number.isFinite(item.sickLeaveAvailable)) {
    out[HR_OVERVIEW_SICK_LEAVE_CODE] = item.sickLeaveAvailable
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
  if (Object.keys(out).length > 0) return out

  return balancesFromSummaryFields(item)
}

export function mapApiHrOverviewItemToTableRow(
  item: ApiEmployeeLeavePolicyHrOverviewItem,
): HrOverviewBalanceTableRow | null {
  const employeeId = resolveEmployeeId(item)
  if (!employeeId) return null
  const employeeCode = resolveEmployeeCode(item)
  return {
    employeeId,
    employeeName: resolveEmployeeName(item),
    employeeCode: employeeCode || undefined,
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

function normalizeLeaveTypeCode(code: string | undefined): string {
  return (code ?? '').trim().toUpperCase()
}

/** Active org leave types plus any extra codes present on hr-overview rows. */
export function resolveHrOverviewBalanceTypeCodes(
  rows: HrOverviewBalanceTableRow[],
  orgLeaveTypes?: { code: string; isActive?: boolean }[],
): string[] {
  if (!hrOverviewRowsHaveBalanceValues(rows)) {
    return []
  }
  const set = new Set(collectHrOverviewBalanceTypeCodes(rows))
  for (const type of orgLeaveTypes ?? []) {
    if (type.isActive === false) continue
    const code = normalizeLeaveTypeCode(type.code)
    if (code) set.add(code)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function hrOverviewRowsHaveBalanceValues(rows: HrOverviewBalanceTableRow[]): boolean {
  return rows.some((row) => Object.keys(row.balancesByCode).length > 0)
}