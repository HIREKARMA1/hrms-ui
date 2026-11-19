import { useMemo } from 'react'

import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { DEMO_ACTOR_BY_ROLE, type LeadsListScope } from '../constants/leadsDemoActor'
import { filterLeadsByScope } from '../utils/filterLeadsByScope'
import { useLeads } from './useLeads'

export function useLeadsScope(role: UserRole, scope: LeadsListScope) {
  const { leads, ...rest } = useLeads()
  const { canAccess } = useOptionalFeatureAccess()
  const actorId = DEMO_ACTOR_BY_ROLE[role]

  const scopedLeads = useMemo(
    () => filterLeadsByScope(leads, scope, actorId),
    [leads, scope, actorId],
  )

  // Existing role-based UI limits are kept; each write action additionally
  // requires its own backend permission (leads:create / update / delete /
  // assign / notes / analytics). leads:read alone grants none of them.
  const canManageLeads = !isEmployeeExperience(role)
  const canCreateLeads = canManageLeads && canAccess('leads.create')
  const canEditLead = canManageLeads && canAccess('leads.update')
  const canDeleteLeads =
    (isHrAdminExperience(role) || isSuperAdminExperience(role)) && canAccess('leads.delete')
  const canAssignLeads = canManageLeads && canAccess('leads.assign')
  const canAddNotes = canAccess('leads.notes')
  const canViewAnalytics = canAccess('leads.analytics')

  return {
    ...rest,
    leads,
    scopedLeads,
    actorId,
    canManageLeads,
    canCreateLeads,
    canDeleteLeads,
    canEditLead,
    canAssignLeads,
    canAddNotes,
    canViewAnalytics,
  }
}
