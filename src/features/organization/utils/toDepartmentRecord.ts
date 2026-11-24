import type { BackendDepartment } from '../api/departmentsApi.types'
import type { DepartmentRecord } from '../types/organization.types'

/** Map an API department row into the existing Department Management table shape. */
export function toDepartmentRecord(dept: BackendDepartment): DepartmentRecord {
  return {
    id: dept.id,
    code: dept.code,
    name: dept.name,
    description: dept.description ?? '',
    headName: '',
    employeeCount: dept.employeeCount,
    status: dept.isActive ? 'Active' : 'Inactive',
  }
}

export function formatEmploymentStatus(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active'
    case 'ON_LEAVE':
      return 'On leave'
    case 'PROBATION':
      return 'Probation'
    case 'TERMINATED':
      return 'Terminated'
    default:
      return status
  }
}
