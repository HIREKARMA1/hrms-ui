import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isManagerExperience,
} from '@/features/leave/constants/userRoles'

import type { Lead } from '../types/lead'
import { filterLeadsByScope } from './filterLeadsByScope'

export function visibleLeadsForRole(
  leads: Lead[],
  role: UserRole,
  actorEmployeeId: string,
): Lead[] {
  if (isEmployeeExperience(role)) {
    return filterLeadsByScope(leads, 'my', actorEmployeeId)
  }
  if (isManagerExperience(role)) {
    return filterLeadsByScope(leads, 'team', actorEmployeeId)
  }
  return leads
}
