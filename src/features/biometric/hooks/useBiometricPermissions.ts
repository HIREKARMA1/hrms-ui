import { useMemo } from 'react'

import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

/**
 * Biometric module UI gating (backend authorizes every request).
 * Device delete is SUPER_ADMIN-only on the API (`@Roles(SUPER_ADMIN)`).
 */
export function useBiometricPermissions() {
  const { canAccess, roleCode } = useOptionalFeatureAccess()

  return useMemo(
    () => ({
      canListDevices: canAccess('attendance.biometric.devices'),
      canConfigureDevices: canAccess('attendance.biometric.configure'),
      canDeleteDevices: roleCode === 'SUPER_ADMIN',
      canSync: canAccess('attendance.biometric.sync'),
      canReadAttendance: canAccess('attendance.biometric.attendanceRead'),
    }),
    [canAccess, roleCode],
  )
}