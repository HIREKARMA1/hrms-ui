import type {
  DepartmentRecord,
  DepartmentTransfer,
  DesignationRecord,
  HierarchyNode,
  JobRoleRecord,
  TeamRecord,
} from '../types/organization.types'

/** Mock organization data — no department/org APIs connected. */
export const departmentsMock: DepartmentRecord[] = [
  {
    id: 'd1',
    name: 'Engineering',
    description: 'Product engineering and platform teams',
    headName: 'Karan Patel',
    employeeCount: 86,
  },
  {
    id: 'd2',
    name: 'HR',
    description: 'People operations and talent',
    headName: 'Meera Iyer',
    employeeCount: 22,
  },
  {
    id: 'd3',
    name: 'Finance',
    description: 'Accounting, payroll support and FP&A',
    headName: 'Vikram Singh',
    employeeCount: 24,
  },
  {
    id: 'd4',
    name: 'Product',
    description: 'Product management and design',
    headName: 'Priya Nair',
    employeeCount: 38,
  },
]

export const teamsMock: TeamRecord[] = [
  {
    id: 't1',
    name: 'Frontend Platform',
    departmentId: 'd1',
    departmentName: 'Engineering',
    leaderName: 'Sneha Reddy',
    memberNames: ['Ananya Sharma', 'Ishita Kapoor', 'Devansh Gupta'],
  },
  {
    id: 't2',
    name: 'Talent Acquisition',
    departmentId: 'd2',
    departmentName: 'HR',
    leaderName: 'Meera Iyer',
    memberNames: ['Neha Joshi', 'Rohan Das'],
  },
]

export const designationsMock: DesignationRecord[] = [
  { id: 'des1', title: 'Senior Engineer', departmentName: 'Engineering', level: 'L4' },
  { id: 'des2', title: 'Engineer', departmentName: 'Engineering', level: 'L3' },
  { id: 'des3', title: 'HR Business Partner', departmentName: 'HR', level: 'L4' },
  { id: 'des4', title: 'Finance Analyst', departmentName: 'Finance', level: 'L3' },
]

export const jobRolesMock: JobRoleRecord[] = [
  {
    id: 'jr1',
    title: 'Frontend Developer',
    designationId: 'des1',
    description: 'Build and maintain React applications',
  },
  {
    id: 'jr2',
    title: 'Backend Developer',
    designationId: 'des2',
    description: 'APIs and service ownership',
  },
  {
    id: 'jr3',
    title: 'Recruiter',
    designationId: 'des3',
    description: 'End-to-end hiring for assigned functions',
  },
]

export const hierarchyMock: HierarchyNode[] = [
  { id: 'h1', name: 'Rohith Goud', role: 'CEO', reportsTo: null },
  { id: 'h2', name: 'Karan Patel', role: 'VP Engineering', reportsTo: 'h1' },
  { id: 'h3', name: 'Meera Iyer', role: 'Head of HR', reportsTo: 'h1' },
  { id: 'h4', name: 'Sneha Reddy', role: 'Frontend Lead', reportsTo: 'h2' },
  { id: 'h5', name: 'Ananya Sharma', role: 'Senior Engineer', reportsTo: 'h4' },
]

export const transferHistoryMock: DepartmentTransfer[] = [
  {
    id: 'tr1',
    employeeName: 'Devansh Gupta',
    fromDepartment: 'Operations',
    toDepartment: 'Product',
    transferredOn: '2026-10-15',
    approvedBy: 'HR Manager',
  },
  {
    id: 'tr2',
    employeeName: 'Neha Joshi',
    fromDepartment: 'HR',
    toDepartment: 'Operations',
    transferredOn: '2026-09-01',
    approvedBy: 'Admin',
  },
]
