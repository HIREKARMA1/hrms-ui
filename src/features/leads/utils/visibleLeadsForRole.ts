import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isManagerExperience,
} from '@/features/leave/constants/userRoles'

import { DEMO_ACTOR_BY_ROLE } from '../constants/leadsDemoActor'
import type { Lead } from '../types/lead'
import { filterLeadsByScope } from './filterLeadsByScope'

export function visibleLeadsForRole(leads: Lead[], role: UserRole): Lead[] {
  const actorId = DEMO_ACTOR_BY_ROLE[role]
  if (isEmployeeExperience(role)) {
    return filterLeadsByScope(leads, 'my', actorId)
  }
  if (isManagerExperience(role)) {
    const seen = new Set<string>()
    const merged: Lead[] = []
    for (const item of [
      ...filterLeadsByScope(leads, 'team', actorId),
      ...filterLeadsByScope(leads, 'my', actorId),
    ]) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      merged.push(item)
    }
    return merged
  }
  return leads
}