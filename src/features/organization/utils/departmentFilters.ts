import type { DepartmentRecord, DepartmentStatus } from '../types/organization.types'

export type DepartmentFilters = {
  headName: string
  status: DepartmentStatus | 'All'
  minEmployees: string
  maxEmployees: string
}

export const EMPTY_DEPARTMENT_FILTERS: DepartmentFilters = {
  headName: 'All',
  status: 'All',
  minEmployees: '',
  maxEmployees: '',
}

export function countActiveDepartmentFilters(filters: DepartmentFilters): number {
  let count = 0
  if (filters.headName !== 'All') count += 1
  if (filters.status !== 'All') count += 1
  if (filters.minEmployees.trim() !== '') count += 1
  if (filters.maxEmployees.trim() !== '') count += 1
  return count
}

function parseBound(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function filterDepartments(
  departments: readonly DepartmentRecord[],
  search: string,
  filters: DepartmentFilters,
): DepartmentRecord[] {
  const q = search.trim().toLowerCase()
  const min = parseBound(filters.minEmployees)
  const max = parseBound(filters.maxEmployees)

  return departments.filter((dept) => {
    if (q) {
      const haystack = `${dept.name} ${dept.code} ${dept.headName}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.headName !== 'All' && dept.headName !== filters.headName) {
      return false
    }
    if (filters.status !== 'All' && dept.status !== filters.status) {
      return false
    }
    if (min !== null && dept.employeeCount < min) return false
    if (max !== null && dept.employeeCount > max) return false
    return true
  })
}
