import { describe, expect, it } from 'vitest'

import {
  mapApiEmployeeLeavePolicyHrOverviewToTableRows,
  resolveHrOverviewBalanceTypeCodes,
} from './mapApiEmployeeLeavePolicyHrOverview'

describe('mapApiEmployeeLeavePolicyHrOverview', () => {
  it('maps nested department object from hr-overview', () => {
    const rows = mapApiEmployeeLeavePolicyHrOverviewToTableRows({
      items: [
        {
          employeeId: 'emp-1',
          employeeName: 'Test User',
          department: { id: 'dept-1', name: 'Engineering' },
          balanceByType: { CL: 5 },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].departmentName).toBe('Engineering')
    expect(rows[0].balancesByCode.CL).toBe(5)
  })

  it('hides type columns when overview rows have no balances', () => {
    const rows = mapApiEmployeeLeavePolicyHrOverviewToTableRows({
      items: [{ employeeId: 'emp-1', employeeName: 'Test User' }],
      total: 1,
      page: 1,
      limit: 20,
    })
    expect(
      resolveHrOverviewBalanceTypeCodes(rows, [
        { code: 'cl', isActive: true },
        { code: 'SL', isActive: true },
      ]),
    ).toEqual([])
  })

  it('maps paidLeaveAvailable and sickLeaveAvailable summary fields', () => {
    const rows = mapApiEmployeeLeavePolicyHrOverviewToTableRows({
      items: [
        {
          employeeId: 'cmwlqi4o80003v0qhvthrbpbh',
          employeeCode: 'HK0030',
          name: 'Akash kumar sahu',
          year: 2026,
          paidLeaveAvailable: 11,
          sickLeaveAvailable: 6,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].employeeName).toBe('Akash kumar sahu')
    expect(rows[0].balancesByCode.EARNED).toBe(11)
    expect(rows[0].balancesByCode.SICK).toBe(6)
  })

  it('uses org leave types when at least one row has balances', () => {
    const rows = mapApiEmployeeLeavePolicyHrOverviewToTableRows({
      items: [
        { employeeId: 'emp-1', employeeName: 'Test User', balanceByType: { CL: 2 } },
        { employeeId: 'emp-2', employeeName: 'Other' },
      ],
      total: 2,
      page: 1,
      limit: 20,
    })
    expect(
      resolveHrOverviewBalanceTypeCodes(rows, [
        { code: 'cl', isActive: true },
        { code: 'SL', isActive: true },
        { code: 'EL', isActive: false },
      ]),
    ).toEqual(['CL', 'SL'])
  })
})