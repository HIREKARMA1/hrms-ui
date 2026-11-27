import { describe, expect, it } from 'vitest'

import { mapLeaveRequest } from '../api/leaveMappers'
import { buildApiLeaveSnapshot } from '../services/leaveApiSnapshot'
import type { LeaveRequest } from '../types/leaveRequest'

import {
  canUserActOnLeaveRequest,
  hrActionableLeaveRequestIds,
  leaveWorkflowApprovalNotice,
  mergeLeaveRequestForWorkflowAction,
} from './leaveWorkflowApproval'
import { mapApiLeaveRequestItem } from './mapApiLeaveRequest'

function pendingWorkflow(id: string): LeaveRequest {
  return mapLeaveRequest({
    id,
    employeeId: 'emp-1',
    leaveTypeId: 'lt-cl',
    startDate: '2030-01-07',
    endDate: '2030-01-07',
    dayPortion: 'FULL_DAY',
    totalDays: 1,
    reason: 'Trip',
    status: 'PENDING',
    workflowId: 'wf-1',
    currentLevel: 1,
    createdAt: '2026-11-20T05:00:00.000Z',
    updatedAt: '2026-11-20T05:00:00.000Z',
    leaveType: { id: 'lt-cl', code: 'CL', name: 'Casual Leave', isPaid: true },
  })!
}

describe('leaveWorkflowApproval', () => {
  it('grants act only when the request id is in the actionable set', () => {
    const request = pendingWorkflow('lv-wf')
    const ids = new Set(['lv-wf'])
    expect(canUserActOnLeaveRequest(request, ids)).toBe(true)
    expect(canUserActOnLeaveRequest(request, new Set())).toBe(false)
    expect(canUserActOnLeaveRequest({ ...request, status: 'Approved' }, ids)).toBe(false)
  })

  it('merges workflow pending rows into HR actionable ids', () => {
    const wf = pendingWorkflow('lv-wf')
    const snapshot = buildApiLeaveSnapshot({
      access: { requests: true, orgWideRequests: true, leaveTypes: true, encashments: false, employeeDirectory: false },
      leaveTypes: [],
      requests: { items: [wf], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 }, employees: [] },
    })
    const employees = snapshot.employees
    const ids = hrActionableLeaveRequestIds(snapshot, employees, [wf], true)
    expect(ids.has('lv-wf')).toBe(true)
  })

  it('describes workflow pending when the viewer can act', () => {
    const request = pendingWorkflow('lv-1')
    expect(leaveWorkflowApprovalNotice(request, true)?.message).toContain('multi-level')
    expect(leaveWorkflowApprovalNotice(request, false)?.message).toContain('not assigned')
  })

  it('merges workflow flags from the catalog when the queue row is thin', () => {
    const full = pendingWorkflow('lv-wf')
    const thin = mapApiLeaveRequestItem({
      id: 'lv-wf',
      employeeId: 'emp-1',
      startDate: '2030-01-07',
      endDate: '2030-01-07',
      status: 'PENDING',
    })
    expect(thin.multiLevelWorkflow).toBeUndefined()
    const merged = mergeLeaveRequestForWorkflowAction(thin, [full])
    expect(merged.multiLevelWorkflow).toBe(true)
    expect(merged.currentStepLabel).toBe('Pending: level 1')
  })
})