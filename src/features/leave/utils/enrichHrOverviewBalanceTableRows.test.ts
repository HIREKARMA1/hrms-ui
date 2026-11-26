import { describe, expect, it } from 'vitest'

import type { HrOverviewBalanceTableRow } from '../types/api/employeeLeavePolicyHrOverview.types'
import type { LeaveEmployee } from '../types/employee'
import { enrichHrOverviewBalanceTableRows } from './enrichHrOverviewBalanceTableRows'

const baseEmployee: LeaveEmployee = {
  id: 'emp-uuid-1',
  name: 'Nitish Kumar',
  department: 'Engineering',
  gender: 'Male',
  joiningDate: '2024-01-01',
  managerId: null,
  employmentStatus: 'ACTIVE',
}

const baseRow: HrOverviewBalanceTableRow = {
  employeeId: 'emp-uuid-1',
  employeeName: 'HK0059',
  employeeCode: 'HK0059',
  departmentName: '—',
  balancesByCode: {},
}

describe('enrichHrOverviewBalanceTableRows', () => {
  it('uses snapshot name and department when API only has employee code', () => {
    const [row] = enrichHrOverviewBalanceTableRows([baseRow], [baseEmployee])
    expect(row.displayName).toBe('Nitish Kumar')
    expect(row.displayCode).toBe('HK0059')
    expect(row.departmentName).toBe('Engineering')
  })

  it('keeps API name when no snapshot match', () => {
    const [row] = enrichHrOverviewBalanceTableRows(
      [{ ...baseRow, employeeId: 'other', employeeName: 'Satya HR', employeeCode: 'HK0001' }],
      [baseEmployee],
    )
    expect(row.displayName).toBe('Satya HR')
    expect(row.displayCode).toBe('HK0001')
  })
})