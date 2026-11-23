import { useMemo } from 'react'

import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

/**
 * Biometric module UI gating (backend authorizes every request).
 */
export function useBiometricPermissions() {
  const { canAccess } = useOptionalFeatureAccess()

  return useMemo(
    () => ({
      canListDevices: canAccess('attendance.biometric.devices'),
      canConfigureDevices: canAccess('attendance.biometric.configure'),
      canSync: canAccess('attendance.biometric.sync'),
      canReadAttendance: canAccess('attendance.biometric.attendanceRead'),
    }),
    [canAccess],
  )
}