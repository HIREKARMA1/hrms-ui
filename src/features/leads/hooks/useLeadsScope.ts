import { useMemo } from 'react'

import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'

import { DEMO_ACTOR_BY_ROLE, type LeadsListScope } from '../constants/leadsDemoActor'
import { filterLeadsByScope } from '../utils/filterLeadsByScope'
import { useLeads } from './useLeads'

export function useLeadsScope(role: UserRole, scope: LeadsListScope) {
  const { leads, ...rest } = useLeads()
  const actorId = DEMO_ACTOR_BY_ROLE[role]

  const scopedLeads = useMemo(
    () => filterLeadsByScope(leads, scope, actorId),
    [leads, scope, actorId],
  )

  const canManageLeads = !isEmployeeExperience(role)
  const canCreateLeads = canManageLeads
  const canDeleteLeads = isHrAdminExperience(role) || isSuperAdminExperience(role)

  return {
    ...rest,
    leads,
    scopedLeads,
    actorId,
    canManageLeads,
    canCreateLeads,
    canDeleteLeads,
    canEditLead: canManageLeads,
  }
}