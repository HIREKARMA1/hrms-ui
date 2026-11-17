export type DepartmentRecord = {
  id: string
  name: string
  description: string
  headName: string
  employeeCount: number
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
