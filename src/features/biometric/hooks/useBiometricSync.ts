import { getApiErrorMessage } from '@/services/api/errors'

import type { BiometricSyncRequest } from '../types/api/biometricSync.types'
import { useSyncBiometricPunchesMutation } from '../api/biometricApi'
import { useBiometricPermissions } from './useBiometricPermissions'

export function useBiometricSync() {
  const { canSync } = useBiometricPermissions()
  const [syncPunches, state] = useSyncBiometricPunchesMutation()

  async function sync(request?: BiometricSyncRequest) {
    if (!canSync) {
      return { ok: false as const, message: 'Missing biometric:sync permission.' }
    }
    try {
      const result = await syncPunches(request).unwrap()
      return { ok: true as const, result }
    } catch (error) {
      return { ok: false as const, message: getApiErrorMessage(error, 'Sync failed.') }
    }
  }

  return { sync, canSync, ...state }
}