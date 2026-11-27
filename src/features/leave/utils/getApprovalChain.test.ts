import { describe, expect, it } from 'vitest'

import type { LeaveEmployee } from '../types/employee'
import type { LeaveTypePolicy } from '../types/leaveSettings'
import { getApprovalChain } from './getApprovalChain'

const hrPolicy: LeaveTypePolicy = {
  code: 'CL',
  label: 'Casual',
  enabled: true,
  paid: true,
  earningModel: 'yearly_quota',
  annualQuotaDays: 10,
  perEventDaysFromThirdChild: null,
  accrualMethod: 'upfront',
  daysWorkedPerAccrualDay: null,
  qualifyingDays: null,
  dayCounting: 'calendar',
  halfDayAllowed: true,
  maxConsecutiveDays: null,
  minNoticeDays: 0,
  backdatingAllowedDays: 0,
  medicalCertificateAfterDays: null,
  eligibleGender: 'All',
  minServiceMonths: 0,
  carryForward: 'none',
  carryForwardCapDays: null,
  encashable: false,
  allowLwpConversion: true,
  compOffExpiryDays: null,
  approvalChain: 'hr',
  managerOnlyUpToDays: null,
}

const applicant: LeaveEmployee = {
  id: 'emp-live-1',
  name: 'Asha',
  department: 'ENG',
  managerId: 'mgr-1',
}

describe('getApprovalChain', () => {
  it('falls back without crashing when demo HR is not in the roster (API mode)', () => {
    const chain = getApprovalChain(hrPolicy, applicant, {}, 2)
    expect(chain).toHaveLength(1)
    expect(chain[0]?.level).toBe('HR')
    expect(chain[0]?.approverName).toBe('HR approval')
    expect(chain[0]?.approverId).toBe('')
  })
})