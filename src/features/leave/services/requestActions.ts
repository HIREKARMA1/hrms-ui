/**
 * Mutations on leave requests, ledger, and approval steps in the mock store.
 * Called from leaveService facade methods only.
 */

import type { LeaveRequest } from '../types/leaveRequest'
import type { LedgerEntry } from '../types/ledger'
import { getLeaveStore } from './mockLeaveStore'
import { HR_DEMO_USER_ID, HR_DEMO_USER_NAME } from '../constants/leaveRules'
import { leaveTodayIso } from '../utils/leaveToday'

export function appendLedger(entry: Omit<LedgerEntry, 'id'>): void {
  const store = getLeaveStore()
  store.ledger.push({ ...entry, id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
}

export function cancelRequest(requestId: string, actorId: string, actorName: string, reason?: string): void {
  const store = getLeaveStore()
  const request = store.requests.find((item) => item.id === requestId)
  if (!request || request.status === 'Cancelled') {
    return
  }
  const wasApproved = request.status === 'Approved'
  request.status = 'Cancelled'
  request.currentLevel = null
  request.currentStepLabel = 'Cancelled'
  request.steps.push({
    id: `ST-${Date.now()}`,
    kind: 'cancellation',
    at: leaveTodayIso(),
    actorId,
    actorName,
    comment: reason,
  })
  if (wasApproved && request.leaveTypeCode !== 'LWP') {
    appendLedger({
      employeeId: request.employeeId,
      leaveTypeCode: request.leaveTypeCode,
      date: leaveTodayIso(),
      kind: 'Cancelled',
      days: request.days,
      balanceAfter: latestBalance(request.employeeId, request.leaveTypeCode) + request.days,
      reason: reason ?? 'Request cancelled',
      by: actorName,
    })
  }
}

function latestBalance(employeeId: string, leaveTypeCode: string): number {
  const store = getLeaveStore()
  const rows = store.ledger.filter(
    (item) => item.employeeId === employeeId && item.leaveTypeCode === leaveTypeCode,
  )
  return rows.length ? rows[rows.length - 1].balanceAfter : 0
}

export function approveRequest(
  requestId: string,
  actorId: string,
  actorName: string,
  level: 'Manager' | 'HR',
  comment?: string,
): void {
  const store = getLeaveStore()
  const request = store.requests.find((item) => item.id === requestId)
  if (!request || request.status !== 'Pending') {
    return
  }
  request.steps.push({
    id: `ST-${Date.now()}`,
    kind: 'approval',
    at: leaveTodayIso(),
    actorId,
    actorName,
    level,
    comment,
  })
  if (level === 'Manager' && request.currentLevel === 'Manager') {
    request.currentLevel = 'HR'
    request.currentStepLabel = 'Pending: HR'
    return
  }
  request.status = 'Approved'
  request.currentLevel = null
  request.currentStepLabel = 'Approved'
  if (request.leaveTypeCode !== 'LWP') {
    appendLedger({
      employeeId: request.employeeId,
      leaveTypeCode: request.leaveTypeCode,
      date: leaveTodayIso(),
      kind: 'Leave taken',
      days: -request.days,
      balanceAfter: latestBalance(request.employeeId, request.leaveTypeCode) - request.days,
      reason: request.reason,
      by: actorName,
    })
  }
}

export function rejectRequest(
  requestId: string,
  actorId: string,
  actorName: string,
  comment: string,
): void {
  const store = getLeaveStore()
  const request = store.requests.find((item) => item.id === requestId)
  if (!request || request.status !== 'Pending') {
    return
  }
  request.status = 'Rejected'
  request.currentLevel = null
  request.currentStepLabel = 'Rejected'
  request.steps.push({
    id: `ST-${Date.now()}`,
    kind: 'rejection',
    at: leaveTodayIso(),
    actorId,
    actorName,
    comment,
  })
}

export function addRequest(request: LeaveRequest): void {
  getLeaveStore().requests.unshift(request)
}

export function nextRequestId(): string {
  const count = getLeaveStore().requests.length + 1
  return `LR-${String(count).padStart(3, '0')}`
}

export function hrActor() {
  return { id: HR_DEMO_USER_ID, name: HR_DEMO_USER_NAME }
}
