import { describe, expect, it } from 'vitest'

import { departmentsMock } from '../mocks/organizationMocks'
import {
  EMPTY_DEPARTMENT_FILTERS,
  countActiveDepartmentFilters,
  filterDepartments,
} from './departmentFilters'

describe('filterDepartments', () => {
  it('searches by department name or head', () => {
    expect(filterDepartments(departmentsMock, 'engine', EMPTY_DEPARTMENT_FILTERS)).toHaveLength(1)
    expect(filterDepartments(departmentsMock, 'meera', EMPTY_DEPARTMENT_FILTERS)[0]?.name).toBe(
      'HR',
    )
  })

  it('filters by department head', () => {
    const result = filterDepartments(departmentsMock, '', {
      ...EMPTY_DEPARTMENT_FILTERS,
      headName: 'Priya Nair',
    })
    expect(result.map((d) => d.name)).toEqual(['Product'])
  })

  it('filters by status', () => {
    const inactive = filterDepartments(departmentsMock, '', {
      ...EMPTY_DEPARTMENT_FILTERS,
      status: 'Inactive',
    })
    expect(inactive).toHaveLength(1)
    expect(inactive[0]?.name).toBe('Product')
  })

  it('filters by employee count range', () => {
    const result = filterDepartments(departmentsMock, '', {
      ...EMPTY_DEPARTMENT_FILTERS,
      minEmployees: '20',
      maxEmployees: '30',
    })
    expect(result.map((d) => d.name).sort()).toEqual(['Finance', 'HR'])
  })

  it('combines search and filters', () => {
    const result = filterDepartments(departmentsMock, 'a', {
      ...EMPTY_DEPARTMENT_FILTERS,
      status: 'Active',
      minEmployees: '20',
    })
    expect(result.every((d) => d.status === 'Active')).toBe(true)
    expect(result.every((d) => d.employeeCount >= 20)).toBe(true)
    expect(
      result.every((d) => `${d.name} ${d.headName}`.toLowerCase().includes('a')),
    ).toBe(true)
  })
})

describe('countActiveDepartmentFilters', () => {
  it('counts only set filters and clears to zero', () => {
    expect(countActiveDepartmentFilters(EMPTY_DEPARTMENT_FILTERS)).toBe(0)
    expect(
      countActiveDepartmentFilters({
        headName: 'Meera Iyer',
        status: 'Active',
        minEmployees: '10',
        maxEmployees: '',
      }),
    ).toBe(3)
  })
})
