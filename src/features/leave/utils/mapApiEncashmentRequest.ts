import type { EncashmentRequest, EncashmentStatus } from '../types/encashment'
import type {
  ApiEncashmentRequestItem,
  HrEncashmentRequestRow,
  LeaveEncashmentListData,
} from '../types/api/leaveEncashmentList.types'

const STATUS_MAP: Record<string, EncashmentStatus> = {
  PENDING: 'Pending approval',
  PENDING_APPROVAL: 'Pending approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Rejected',
  PENDING_PAYOUT: 'Pending payout',
  PAID: 'Paid via payroll',
  PAID_VIA_PAYROLL: 'Paid via payroll',
}

function mapStatus(status: string | undefined): EncashmentStatus {
  if (!status) return 'Pending approval'
  const key = status.toUpperCase().replace(/\s+/g, '_')
  return STATUS_MAP[key] ?? 'Pending approval'
}

function resolveEmployeeId(item: ApiEncashmentRequestItem): string {
  return (item.employee?.id ?? item.employeeId ?? '').trim()
}

function resolveEmployeeDisplayName(item: ApiEncashmentRequestItem): string | undefined {
  const employee = item.employee
  if (!employee) return undefined
  const full = employee.fullName?.trim()
  if (full) return full
  const parts = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim()
  return parts || undefined
}

function resolveLeaveTypeCode(item: ApiEncashmentRequestItem): string {
  return (
    item.leaveType?.code ??
    item.leaveTypeCode ??
    item.leaveTypeId?.slice(0, 8) ??
    'EL'
  )
}

function resolveDays(item: ApiEncashmentRequestItem): number {
  if (typeof item.days === 'number') return item.days
  if (typeof item.requestedDays === 'number') return item.requestedDays
  if (typeof item.totalDays === 'number') return item.totalDays
  return 0
}

function resolveAppliedOn(item: ApiEncashmentRequestItem): string {
  return item.appliedOn ?? item.appliedAt ?? item.createdAt ?? new Date().toISOString().slice(0, 10)
}

function resolveApprovedOn(item: ApiEncashmentRequestItem): string | undefined {
  return item.approvedOn ?? item.approvedAt
}

export function mapApiEncashmentItemToHrRow(item: ApiEncashmentRequestItem): HrEncashmentRequestRow {
  const status = mapStatus(item.status)
  return {
    id: item.id,
    employeeId: resolveEmployeeId(item),
    employeeDisplayName: resolveEmployeeDisplayName(item),
    leaveTypeCode: resolveLeaveTypeCode(item),
    days: resolveDays(item),
    appliedOn: resolveAppliedOn(item).slice(0, 10),
    status,
    approvedOn: resolveApprovedOn(item)?.slice(0, 10),
  }
}

export function mapApiEncashmentListToHrRows(data: LeaveEncashmentListData): HrEncashmentRequestRow[] {
  return data.items.map(mapApiEncashmentItemToHrRow)
}

export function mapApiEncashmentItemToEncashmentRequest(
  item: ApiEncashmentRequestItem,
): EncashmentRequest {
  return {
    id: item.id,
    employeeId: resolveEmployeeId(item),
    leaveTypeCode: resolveLeaveTypeCode(item),
    days: resolveDays(item),
    appliedOn: resolveAppliedOn(item).slice(0, 10),
    status: mapStatus(item.status),
    approvedOn: resolveApprovedOn(item)?.slice(0, 10),
  }
}

export function filterHrEncashmentRows(
  rows: HrEncashmentRequestRow[],
  search: string,
  employeeNameFromSnapshot: (id: string) => string,
): HrEncashmentRequestRow[] {
  const query = search.trim().toLowerCase()
  if (!query) return rows
  return rows.filter((row) => {
    const name = (row.employeeDisplayName ?? employeeNameFromSnapshot(row.employeeId)).toLowerCase()
    return (
      name.includes(query) ||
      row.employeeId.toLowerCase().includes(query) ||
      row.leaveTypeCode.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query)
    )
  })
}