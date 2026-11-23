import { useMemo } from 'react'

import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

/**
 * Backend-permission checks for Leave actions (UI gating only; the backend
 * still authorizes every request). Outside an RBAC context nothing is granted.
 * Each flag maps to its own backend code - `leaves:read` never implies
 * create, cancel or approve.
 */
export function useLeavePermissions() {
  const { canAccess } = useOptionalFeatureAccess()

  return useMemo(
    () => ({
      canCreate: canAccess('leave.create'),
      canCreateOnBehalf: canAccess('leave.createOnBehalf'),
      canCancel: canAccess('leave.cancel'),
      canApprove: canAccess('leave.approve'),
      canRunAccrual: canAccess('leave.accruals.run'),
      canViewEncashments: canAccess('leave.encashments.view'),
      canRequestEncashment: canAccess('leave.encashments.create'),
      canCancelEncashment: canAccess('leave.encashments.cancel'),
      canApproveEncashment: canAccess('leave.encashments.approve'),
      canRejectEncashment: canAccess('leave.encashments.reject'),
      canAdjustBalance: canAccess('leave.balances.adjust'),
      canViewPolicyDefaults: canAccess('leave.balances'),
      canUpdateLeaveTypes: canAccess('leave.types.update'),
    }),
    [canAccess],
  )
}
