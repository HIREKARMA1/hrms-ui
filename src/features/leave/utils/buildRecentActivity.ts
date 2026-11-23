/**
 * Last N leave module events for HR Overview recent activity feed.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import { HR_DEMO_USER_NAME } from '../constants/leaveRules'
import { formatDateRange } from './formatDateRange'

export type ActivityEventKind = 'applied' | 'approved' | 'rejected' | 'cancelled' | 'escalated' | 'adjustment' | 'accrual'

export type RecentActivityItem = {
  id: string
  at: string
  kind: ActivityEventKind
  actorName: string
  sentence: string
  requestId?: string
  employeeName: string
  leaveTypeLabel: string
}

export function buildRecentActivity(snapshot: LeaveSnapshot, limit = 8): RecentActivityItem[] {
  const byId = Object.fromEntries(snapshot.employees.map((item) => [item.id, item.name]))
  const items: RecentActivityItem[] = []
  for (const request of snapshot.requests) {
    const employeeName = byId[request.employeeId] ?? request.employeeId
    const typeLabel = LEAVE_TYPE_LABELS[request.leaveTypeCode as LeaveTypeCode] ?? request.leaveTypeCode
    const range = formatDateRange(request.fromDate, request.toDate)
    for (const step of request.steps) {
      const kind = mapKind(step.kind)
      if (!kind) continue
      const actorName =
        step.kind === 'escalation'
          ? 'System'
          : step.actorName === 'Applicant' || step.actorName === 'System'
            ? step.kind === 'approval' || step.kind === 'rejection'
              ? step.actorName === 'System'
                ? 'System'
                : step.actorName
              : employeeName
            : step.actorName
      const sentence = buildSentence(kind, employeeName, typeLabel, range, step.comment)
      items.push({
        id: step.id,
        at: step.at,
        kind,
        actorName,
        sentence,
        requestId: request.id,
        employeeName,
        leaveTypeLabel: typeLabel,
      })
    }
  }
  for (const month of snapshot.accrualRuns) {
    items.push({
      id: `accrual-${month}`,
      at: `${month}-01T09:00:00`,
      kind: 'accrual',
      actorName: HR_DEMO_USER_NAME,
      sentence: `Monthly accrual run posted for ${month}.`,
      employeeName: 'All employees',
      leaveTypeLabel: 'Accrual',
    })
  }
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}

function mapKind(kind: string): ActivityEventKind | null {
  if (kind === 'applied') return 'applied'
  if (kind === 'approval') return 'approved'
  if (kind === 'rejection') return 'rejected'
  if (kind === 'cancellation') return 'cancelled'
  if (kind === 'escalation') return 'escalated'
  if (kind === 'delegation') return 'adjustment'
  return null
}

function buildSentence(kind: ActivityEventKind, employee: string, typeLabel: string, range: string, comment?: string) {
  if (kind === 'applied') return `${employee} applied for ${typeLabel}, ${range}`
  if (kind === 'approved') return `${employee}'s ${typeLabel} was approved (${range})`
  if (kind === 'rejected') return `${employee}'s ${typeLabel} was rejected${comment ? `: ${comment}` : ''}`
  if (kind === 'cancelled') return `${employee} cancelled ${typeLabel}${comment ? `: ${comment}` : ''}`
  if (kind === 'escalated') return `${employee}'s ${typeLabel} request was escalated (${range})`
  return `${employee}'s ${typeLabel} was updated (${range})`
}
