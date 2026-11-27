import { mapLeaveRequest } from '../api/leaveMappers'
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

function resolveAppliedOn(item: ApiLeaveRequestItem): string {
  const raw = item.appliedAt ?? item.createdAt ?? item.startDate
  if (raw?.trim()) return raw.trim().slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

function workflowStepLabel(status: LeaveRequestStatus, item: ApiLeaveRequestItem): string {
  const multiLevel = Boolean(item.workflowId)
  if (status !== 'Pending') return status
  if (multiLevel) {
    return typeof item.currentLevel === 'number' ? `Pending: level ${item.currentLevel}` : 'Pending'
  }
  return 'Pending: HR'
}

export function mapApiLeaveRequestItem(item: ApiLeaveRequestItem): LeaveRequest {
  const status = mapStatus(String(item.status))
  const appliedOn = resolveAppliedOn(item)
  const employeeId = resolveApiEmployeeId(item)
  const multiLevelWorkflow = Boolean(item.workflowId)
  const lop = item.lopDays ?? item.lwpDays

  return {
    id: item.id,
    employeeId,
    employeeName: resolveEmployeeDisplayName(item),
    leaveTypeCode: resolveLeaveTypeCode(item),
    fromDate: item.startDate,
    toDate: item.endDate,
    days: resolveDays(item),
    lwpDays: typeof lop === 'number' && lop > 0 ? lop : item.lwpDays,
    segments: [],
    reason: item.reason?.trim() ? item.reason : '—',
    appliedOn,
    status,
    currentLevel: status === 'Pending' && !multiLevelWorkflow ? 'HR' : null,
    currentStepLabel: workflowStepLabel(status, item),
    escalated: false,
    multiLevelWorkflow: multiLevelWorkflow || undefined,
    convertedToLwp: typeof lop === 'number' && lop > 0 ? true : undefined,
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

/** Maps pending-queue rows; prefers strict `mapLeaveRequest` when the API sends workflow fields. */
export function mapPendingApprovalItem(item: ApiLeaveRequestItem): LeaveRequest {
  const employeeId = resolveApiEmployeeId(item)
  const forMapper = {
    ...item,
    employeeId: employeeId || item.employeeId,
    leaveTypeId: item.leaveTypeId ?? item.leaveType?.id ?? '',
    dayPortion: item.dayPortion ?? 'FULL_DAY',
    totalDays: resolveDays(item),
    lopDays: item.lopDays ?? item.lwpDays ?? 0,
    createdAt: item.createdAt ?? item.appliedAt ?? item.startDate,
    workflowId: item.workflowId ?? null,
    currentLevel: item.currentLevel ?? null,
  }
  return mapLeaveRequest(forMapper) ?? mapApiLeaveRequestItem(item)
}

export function mapApiLeaveListToRequests(data: LeaveListData): LeaveRequest[] {
  return data.items.map(mapApiLeaveRequestItem)
}

export function mapPendingApprovalsToRequests(items: ApiLeaveRequestItem[]): LeaveRequest[] {
  return items.map(mapPendingApprovalItem)
}