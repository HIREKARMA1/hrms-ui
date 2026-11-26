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

  it('uses org leave types for columns when overview rows have no balances', () => {
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
        { code: 'EL', isActive: false },
      ]),
    ).toEqual(['CL', 'SL'])
  })
})