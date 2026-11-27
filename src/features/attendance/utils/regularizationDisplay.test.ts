import { describe, expect, it } from 'vitest'

import {
  formatRegularizationEmployeePrimary,
  formatRegularizationEmployeeSecondary,
} from './regularizationDisplay'

describe('formatRegularizationEmployee', () => {
  it('shows name as primary and code as secondary', () => {
    const record = {
      employeeName: 'Nitish Kumar Nanda',
      employeeCode: 'HK0021',
      employeeId: 'cmwlqi4o80003v0qhvthrbpbh',
    }
    expect(formatRegularizationEmployeePrimary(record)).toBe('Nitish Kumar Nanda')
    expect(formatRegularizationEmployeeSecondary(record)).toBe(
      'HK0021 · cmwlqi4o80003v0qhvthrbpbh',
    )
  })

  it('falls back to code when name missing', () => {
    const record = { employeeCode: 'HK0021', employeeId: 'id-1' }
    expect(formatRegularizationEmployeePrimary(record)).toBe('HK0021')
    expect(formatRegularizationEmployeeSecondary(record)).toBe('id-1')
  })

  it('does not duplicate id on secondary when id is primary', () => {
    const record = { employeeId: 'cmwlqi4o80003v0qhvthrbpbh' }
    expect(formatRegularizationEmployeePrimary(record)).toBe('cmwlqi4o80003v0qhvthrbpbh')
    expect(formatRegularizationEmployeeSecondary(record)).toBeNull()
  })
})