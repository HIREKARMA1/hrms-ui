import { describe, expect, it } from 'vitest'

import type { ApiLeaveRequestItem } from '../types/api/leaveList.types'

import { mapApiLeaveRequestItem, mapPendingApprovalItem } from './mapApiLeaveRequest'

const basePending: ApiLeaveRequestItem = {
  id: 'lv-wf',
  employeeId: 'emp-1',
  leaveTypeId: 'lt-pl',
  leaveType: { id: 'lt-pl', code: 'PL', name: 'Paid Leave' },
  startDate: '2026-11-25',
  endDate: '2026-11-28',
  status: 'PENDING',
  totalDays: 4,
  reason: 'late',
  workflowId: 'wf-1',
  currentLevel: 1,
  createdAt: '2026-11-25T10:00:00.000Z',
}

describe('mapPendingApprovalItem', () => {
  it('sets multiLevelWorkflow and Pending: level N from workflow fields', () => {
    const row = mapPendingApprovalItem(basePending)
    expect(row.multiLevelWorkflow).toBe(true)
    expect(row.currentStepLabel).toBe('Pending: level 1')
    expect(row.appliedOn).toBe('2026-11-25')
  })

  it('falls back without workflowId to single-level HR pending label', () => {
    const row = mapApiLeaveRequestItem({ ...basePending, workflowId: null, currentLevel: null })
    expect(row.multiLevelWorkflow).toBeUndefined()
    expect(row.currentStepLabel).toBe('Pending: HR')
  })
})