import type { ApiLeaveRequestItem, LeaveListData } from '../types/api/leaveList.types'
import type { LeaveRequest, LeaveRequestStatus } from '../types/leaveRequest'

const STATUS_MAP: Record<string, LeaveRequestStatus> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

function mapStatus(status: string): LeaveRequestStatus {
  return STATUS_MAP[status.toUpperCase()] ?? 'Pending'
}

function resolveLeaveTypeCode(item: ApiLeaveRequestItem): string {
  return (
    item.leaveType?.code ??
    item.leaveTypeCode ??
    item.leaveTypeId?.slice(0, 8) ??
    'LV'
  )
}

function resolveDays(item: ApiLeaveRequestItem): number {
  if (typeof item.totalDays === 'number') return item.totalDays
  if (typeof item.paidDays === 'number') return item.paidDays
  return 1
}

function resolveApiEmployeeId(item: ApiLeaveRequestItem): string {
  return (item.employee?.id ?? item.employeeId ?? '').trim()
}

function resolveEmployeeDisplayName(item: ApiLeaveRequestItem): string | undefined {
  const employee = item.employee
  if (!employee) return undefined
  const full = employee.fullName?.trim()
  if (full) return full
  const parts = [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim()
  return parts || undefined
}

export function mapApiLeaveRequestItem(item: ApiLeaveRequestItem): LeaveRequest {
  const status = mapStatus(String(item.status))
  const appliedOn =
    item.appliedAt ?? item.createdAt ?? item.startDate ?? new Date().toISOString()

  const employeeId = resolveApiEmployeeId(item)

  return {
    id: item.id,
    employeeId,
    employeeName: resolveEmployeeDisplayName(item),
    leaveTypeCode: resolveLeaveTypeCode(item),
    fromDate: item.startDate,
    toDate: item.endDate,
    days: resolveDays(item),
    lwpDays: item.lwpDays,
    segments: [],
    reason: item.reason?.trim() ? item.reason : '—',
    appliedOn,
    status,
    currentLevel: null,
    currentStepLabel: status,
    escalated: false,
    steps: [
      {
        id: `${item.id}-applied`,
        kind: 'applied',
        at: appliedOn,
        actorId: employeeId,
        actorName: 'Applicant',
      },
    ],
  }
}

export function mapApiLeaveListToRequests(data: LeaveListData): LeaveRequest[] {
  return data.items.map(mapApiLeaveRequestItem)
}