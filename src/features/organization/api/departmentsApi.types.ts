/**
 * Department Management shapes from production OpenAPI (`/api/v1/departments`).
 * Parent / department-head fields are not supported by the backend schema.
 */

export type BackendDepartment = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  employeeCount: number
}

export type DepartmentEmployeeSummary = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  name: string
}

export type BackendDepartmentDetail = BackendDepartment & {
  employees: DepartmentEmployeeSummary[]
}

export type DepartmentEmployeeListItem = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  designation: string
  employmentStatus: string
  dateOfJoining: string
}

export type DepartmentsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DepartmentsPage = {
  items: BackendDepartment[]
  pagination: DepartmentsPagination
}

export type DepartmentEmployeesPage = {
  items: DepartmentEmployeeListItem[]
  pagination: DepartmentsPagination
}

export type DepartmentSortBy = 'name' | 'code' | 'createdAt' | 'updatedAt'

export type ListDepartmentsArgs = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: DepartmentSortBy
  sortOrder?: 'asc' | 'desc'
}

export type DepartmentEmployeeSortBy =
  | 'employeeCode'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'designation'
  | 'employmentStatus'
  | 'dateOfJoining'

export type ListDepartmentEmployeesArgs = {
  id: string
  page?: number
  limit?: number
  search?: string
  employmentStatus?: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED'
  sortBy?: DepartmentEmployeeSortBy
  sortOrder?: 'asc' | 'desc'
}

/** POST /departments — `code` and `name` required; head/parent fields rejected. */
export type CreateDepartmentBody = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

/** PATCH /departments/:id — at least one field required. */
export type UpdateDepartmentBody = {
  code?: string
  name?: string
  description?: string | null
  isActive?: boolean
}
