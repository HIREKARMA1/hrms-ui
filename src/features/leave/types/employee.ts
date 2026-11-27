/**
 * Leave module employee record with manager hierarchy for approvals.
 * Used by mock data, services, and org-aware tabs.
 */

import type { EmploymentStatus } from '../constants/employmentStatuses'

export type EmployeeGender = 'Female' | 'Male' | 'Other'

export type LeaveEmployee = {
  id: string
  /** Employee code (e.g. HK0030) when sourced from directory. */
  employeeCode?: string
  name: string
  department: string
  gender: EmployeeGender
  joiningDate: string
  managerId: string | null
  roleTitle?: string
  /** Stored status; ON_LEAVE is also derived when on approved leave today. */
  employmentStatus: Exclude<EmploymentStatus, 'ON_LEAVE'>
}
