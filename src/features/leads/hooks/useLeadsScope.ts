import { useMemo } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import type { LeadsListScope } from '../constants/leadsDemoActor'
import { filterLeadsByScope } from '../utils/filterLeadsByScope'
import { useLeads } from './useLeads'

export function useLeadsScope(role: UserRole, scope: LeadsListScope) {
  const { leads, ...rest } = useLeads()
  const { canAccess } = useOptionalFeatureAccess()
  const { user } = useAuthenticatedUser()
  const actorId = user?.employeeId ?? ''

  const scopedLeads = useMemo(
    () => filterLeadsByScope(leads, scope, actorId),
    [leads, scope, actorId],
  )

  // Role-based UI limits for manage/edit/delete; create and assign are
  // permission-driven so employees with leads:create / leads:assign can do both.
  // leads:read alone grants none of the write actions.
  const canManageLeads = !isEmployeeExperience(role)
  const canCreateLeads = canAccess('leads.create')
  const canEditLead = canManageLeads && canAccess('leads.update')
  const canDeleteLeads =
    (isHrAdminExperience(role) || isSuperAdminExperience(role)) && canAccess('leads.delete')
  const canAssignLeads = canAccess('leads.assign')
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
