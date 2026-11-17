/**
 * Demo employee ids for leads scope until auth profile is wired.
 */

import type { UserRole } from '@/features/leave/constants/userRoles'

export const DEMO_ACTOR_BY_ROLE: Record<UserRole, string> = {
  SUPER_ADMIN: 'EMP-1001',
  HR_ADMIN: 'EMP-1001',
  MANAGER: 'EMP-1002',
  EMPLOYEE: 'EMP-1006',
}

/** Assignees visible to HR (Manager) as "team leads". */
export const MANAGER_TEAM_ASSIGNEE_IDS = ['EMP-1001', 'EMP-1002', 'EMP-1003', 'EMP-1005'] as const

export type LeadsListScope = 'org' | 'my' | 'team'