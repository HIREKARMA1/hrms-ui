export type DepartmentStatus = 'Active' | 'Inactive'

export type DepartmentRecord = {
  id: string
  /** Unique department code from the API (A–Z / 0–9 / _ / -). */
  code: string
  name: string
  description: string
  /**
   * Department head is not supported by the current departments API.
   * Kept for legacy mock/designation UI; API-backed rows use an empty string.
   */
  headName: string
  employeeCount: number
  status: DepartmentStatus
}

export type TeamRecord = {
  id: string
  name: string
  departmentId: string
  departmentName: string
  leaderName: string
  memberNames: string[]
}

export type DesignationRecord = {
  id: string
  title: string
  departmentName: string
  level: string
}

export type JobRoleRecord = {
  id: string
  title: string
  designationId: string
  description: string
}

export type HierarchyNode = {
  id: string
  name: string
  role: string
  reportsTo: string | null
}

export type DepartmentTransfer = {
  id: string
  employeeName: string
  fromDepartment: string
  toDepartment: string
  transferredOn: string
  approvedBy: string
}
