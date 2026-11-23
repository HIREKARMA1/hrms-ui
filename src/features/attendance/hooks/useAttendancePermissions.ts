import { useMemo } from 'react'

import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

/**
 * Attendance report + regularisation UI gates (backend authorizes every request).
 */
export function useAttendancePermissions() {
  const { canAccess } = useOptionalFeatureAccess()

  return useMemo(
    () => ({
      canViewEmployeeReports: canAccess('attendance.reports'),
      canRegularize:
        canAccess('attendance.regularization') || canAccess('attendance.regularization.my'),
    }),
    [canAccess],
  )
}