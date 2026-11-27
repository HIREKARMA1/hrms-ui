import { describe, expect, it } from 'vitest'

import { countLowBalanceEmployeesFromHrOverview } from './countLowBalanceFromHrOverview'

describe('countLowBalanceEmployeesFromHrOverview', () => {
  it('counts employees under threshold on CL or PL', () => {
    const count = countLowBalanceEmployeesFromHrOverview([
      {
        employeeId: 'e1',
        employeeName: 'A',
        departmentName: 'Eng',
        balancesByCode: { CL: 2, PL: 10 },
      },
      {
        employeeId: 'e2',
        employeeName: 'B',
        departmentName: 'Eng',
        balancesByCode: { CL: 5, SL: 5 },
      },
    ])
    expect(count).toBe(1)
  })
})