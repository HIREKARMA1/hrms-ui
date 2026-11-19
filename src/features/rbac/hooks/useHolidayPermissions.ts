import { useMemo } from 'react'

import { useOptionalFeatureAccess } from './useFeatureAccess'

/**
 * Holiday action permissions (UI gating only; the backend authorizes every
 * request). Each flag maps to its own backend code: `holidays:read` never
 * implies create, update or delete. Outside an RBAC context nothing is granted.
 */
export function useHolidayPermissions() {
  const { canAccess } = useOptionalFeatureAccess()

  return useMemo(
    () => ({
      canView: canAccess('attendance.holidays'),
      canCreate: canAccess('holidays.create'),
      canUpdate: canAccess('holidays.update'),
      canDelete: canAccess('holidays.delete'),
    }),
    [canAccess],
  )
}
