/**
 * Leave module employee record with manager hierarchy for approvals.
 * Used by mock data, services, and org-aware tabs.
 */

export type EmployeeGender = 'Female' | 'Male' | 'Other'

export type LeaveEmployee = {
  id: string
  name: string
  department: string
  gender: EmployeeGender
  joiningDate: string
  managerId: string | null
  roleTitle?: string
}
