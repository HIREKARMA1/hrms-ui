import { describe, expect, it } from 'vitest'

import {
  departmentOptionsFromCatalog,
  departmentOptionsFromJobs,
  resolveDepartmentFilterOptions,
} from './departmentFilterOptions'

const JOBS = [
  {
    departmentId: 'd-eng',
    department: { id: 'd-eng', name: 'Engineering' },
  },
  {
    departmentId: 'd-hr',
    department: { id: 'd-hr', name: 'Human Resources' },
  },
  {
    departmentId: 'd-eng',
    department: { id: 'd-eng', name: 'Engineering' },
  },
]

describe('departmentFilterOptions', () => {
  it('uses the departments catalog when departments:manage is available', () => {
    expect(
      resolveDepartmentFilterOptions({
        canListDepartments: true,
        catalogItems: [
          { id: 'd-hr', name: 'Human Resources' },
          { id: 'd-eng', name: 'Engineering' },
        ],
        jobs: JOBS,
      }),
    ).toEqual([
      { id: 'd-eng', name: 'Engineering' },
      { id: 'd-hr', name: 'Human Resources' },
    ])
  })

  it('derives options from jobs when the departments catalog is forbidden', () => {
    expect(
      resolveDepartmentFilterOptions({
        canListDepartments: false,
        catalogItems: [{ id: 'secret', name: 'Should Not Appear' }],
        jobs: JOBS,
      }),
    ).toEqual([
      { id: 'd-eng', name: 'Engineering' },
      { id: 'd-hr', name: 'Human Resources' },
    ])
  })

  it('keeps the selected department visible while filtering a single page', () => {
    expect(
      departmentOptionsFromJobs(
        [{ departmentId: 'd-eng', department: { id: 'd-eng', name: 'Engineering' } }],
        { id: 'd-sales', name: 'Sales' },
      ),
    ).toEqual([
      { id: 'd-eng', name: 'Engineering' },
      { id: 'd-sales', name: 'Sales' },
    ])
  })

  it('returns an empty catalog list safely', () => {
    expect(departmentOptionsFromCatalog(undefined)).toEqual([])
    expect(departmentOptionsFromCatalog([])).toEqual([])
  })
})
