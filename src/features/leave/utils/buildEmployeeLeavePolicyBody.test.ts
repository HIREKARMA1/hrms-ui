import { describe, expect, it } from 'vitest'

import {
  buildAssignEmployeeLeaveDefaultsBody,
  buildAssignEmployeeLeavePolicyBody,
} from './buildEmployeeLeavePolicyBody'

describe('buildEmployeeLeavePolicyBody', () => {
  it('builds company-defaults assign body', () => {
    const result = buildAssignEmployeeLeavePolicyBody({
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      year: 2026,
      useCompanyDefaults: true,
      grantMode: 'MONTHLY_ACCRUAL',
      annualEntitlement: '12',
      monthlyAccrualAmount: '1',
      notes: '',
      effectiveFrom: '2026-01-01',
      effectiveTo: '',
    })
    expect(result).toEqual({
      ok: true,
      body: {
        employeeId: 'emp-1',
        leaveTypeId: 'lt-1',
        year: 2026,
        useCompanyDefaults: true,
        isActive: true,
        effectiveFrom: '2026-01-01',
      },
    })
  })

  it('builds custom entitlement body', () => {
    const result = buildAssignEmployeeLeavePolicyBody({
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      year: 2026,
      useCompanyDefaults: false,
      grantMode: 'ANNUAL_GRANT',
      annualEntitlement: '18',
      monthlyAccrualAmount: '0',
      notes: 'Probation',
      effectiveFrom: '2026-04-01',
      effectiveTo: '2026-12-31',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.body.grantMode).toBe('ANNUAL_GRANT')
      expect(result.body.annualEntitlement).toBe(18)
      expect(result.body.effectiveFrom).toBe('2026-04-01')
      expect(result.body.effectiveTo).toBe('2026-12-31')
    }
  })

  it('rejects invalid effective from', () => {
    const result = buildAssignEmployeeLeavePolicyBody({
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      year: 2026,
      useCompanyDefaults: true,
      grantMode: 'MONTHLY_ACCRUAL',
      annualEntitlement: '12',
      monthlyAccrualAmount: '1',
      notes: '',
      effectiveFrom: '',
      effectiveTo: '',
    })
    expect(result.ok).toBe(false)
  })

  it('builds assign-defaults body', () => {
    expect(buildAssignEmployeeLeaveDefaultsBody({ employeeId: 'emp-1', year: 2026 })).toEqual({
      ok: true,
      body: { employeeId: 'emp-1', year: 2026 },
    })
  })
})