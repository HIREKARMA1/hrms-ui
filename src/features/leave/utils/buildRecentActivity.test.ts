import { describe, expect, it } from 'vitest'

import { createDefaultLeaveSettings } from '../services/companyDefaults'
import type { LeaveSnapshot } from '../services/leaveService'
import { buildRecentActivity } from './buildRecentActivity'

describe('buildRecentActivity', () => {
  it('skips mock accrual rows in server mode', () => {
    const snapshot: LeaveSnapshot = {
      employees: [],
      settings: createDefaultLeaveSettings(),
      requests: [],
      ledger: [],
      compOffLots: [],
      compOffRequests: [],
      encashments: [],
      delegations: [],
      accrualRuns: ['2026-11'],
      yearEndRuns: [],
      settingsHistory: [],
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
    expect(buildRecentActivity(snapshot)).toEqual([])
  })
})