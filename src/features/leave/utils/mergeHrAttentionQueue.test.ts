import { describe, expect, it } from 'vitest'

import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveRequest } from '../types/leaveRequest'
import { createDefaultLeaveSettings } from '../services/companyDefaults'
import { mergeHrAttentionQueue } from './mergeHrAttentionQueue'
import { buildAttentionSummary } from './buildAttentionSummary'

function pendingRequest(id: string, level: LeaveRequest['currentLevel'] = 'HR'): LeaveRequest {
  return {
    id,
    employeeId: 'e1',
    leaveTypeCode: 'CL',
    fromDate: '2026-12-01',
    toDate: '2026-12-01',
    days: 1,
    status: 'Pending',
    currentLevel: level,
    appliedOn: '2026-11-20',
    escalated: false,
    multiLevelWorkflow: level !== 'HR',
    halfDay: false,
    reason: '',
  }
}

function minimalSnapshot(requests: LeaveRequest[]): LeaveSnapshot {
  return {
    employees: [{ id: 'e1', name: 'A', department: 'Eng', employmentStatus: 'ACTIVE', code: 'HK1' }],
    settings: createDefaultLeaveSettings(),
    requests,
    ledger: [],
    compOffLots: [],
    compOffRequests: [],
    encashments: [],
    delegations: [],
    accrualRuns: [],
    yearEndRuns: [],
    settingsHistory: [],
  }
}

describe('mergeHrAttentionQueue', () => {
  it('dedupes workflow pending with snapshot queue', () => {
    const snapshot = minimalSnapshot([pendingRequest('lr-1')])
    const merged = mergeHrAttentionQueue(snapshot, [pendingRequest('lr-1'), pendingRequest('lr-2')])
    expect(merged.map((row) => row.id).sort()).toEqual(['lr-1', 'lr-2'])
  })

  it('buildAttentionSummary uses server other items without accrual mock', () => {
    const snapshot = {
      ...minimalSnapshot([]),
      api: {
        access: {
          requests: true,
          orgWideRequests: true,
          leaveTypes: true,
          encashments: true,
          employeeDirectory: true,
        },
        leaveTypes: [],
        requestTotal: 0,
        encashmentTotal: 0,
      },
    }
    const summary = buildAttentionSummary(snapshot, {
      workflowPending: [],
      lowBalanceEmployeeCount: 0,
      serverOtherItems: true,
    })
    expect(summary.otherItems.some((item) => item.key === 'acc')).toBe(false)
  })
})