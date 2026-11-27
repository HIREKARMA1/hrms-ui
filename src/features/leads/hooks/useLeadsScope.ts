import { useMemo } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import type { UserRole } from '@/features/leave/constants/userRoles'
import {
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

  // Create / update / assign / notes / analytics are permission-driven so
  // employees and managers with leads:update can move and edit scoped leads.
  // Delete stays admin-only. leads:read alone grants no write actions.
  const canCreateLeads = canAccess('leads.create')
  const canEditLead = canAccess('leads.update')
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
    canCreateLeads,
    canDeleteLeads,
    canEditLead,
    canAssignLeads,
    canAddNotes,
    canViewAnalytics,
  }
}
