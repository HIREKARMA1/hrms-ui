import { useCallback } from 'react'

import {
  useBiometricConnectionTest,
  useBiometricDeviceList,
  useBiometricPermissions,
  useBiometricSync,
  useRegisterBiometricDevice,
  useTimeWatchDeviceCatalog,
  useUpdateBiometricDevice,
} from '@/features/biometric/hooks'
import type { BiometricDevice } from '@/features/biometric/types/api/biometricDevices.types'
import type { BiometricSyncResult } from '@/features/biometric/types/api/biometricSync.types'
import { getApiErrorMessage } from '@/services/api/errors'

import type { BiometricDeviceFormState } from '../components/biometric/BiometricDeviceFormDialog'

type ToastFn = (message: string) => void

export type BiometricSyncUiOutcome =
  | { ok: true; scopeLabel: string; result: BiometricSyncResult }
  | { ok: false; scopeLabel: string; message: string }

export function useAttendanceBiometricSettings(toast: ToastFn) {
  const perms = useBiometricPermissions()
  const devices = useBiometricDeviceList({ page: 1, limit: 50 })
  const timewatch = useTimeWatchDeviceCatalog()
  const connection = useBiometricConnectionTest()
  const { sync, canSync, isLoading: syncLoading } = useBiometricSync()
  const register = useRegisterBiometricDevice()
  const update = useUpdateBiometricDevice()

  const refetchAll = useCallback(() => {
    void devices.refetch()
    void timewatch.refetch()
    void connection.refetch()
  }, [connection, devices, timewatch])

  const runConnectionTest = useCallback(async () => {
    await connection.refetch()
  }, [connection])

  const runSync = useCallback(
    async (deviceCode?: string): Promise<BiometricSyncUiOutcome> => {
      const scopeLabel = deviceCode ? `Device ${deviceCode}` : 'All registered devices'
      const outcome = await sync(deviceCode ? { deviceCode } : undefined)
      if (outcome.ok) {
        refetchAll()
        return { ok: true, scopeLabel, result: outcome.result }
      }
      return { ok: false, scopeLabel, message: outcome.message }
    },
    [refetchAll, sync],
  )

  const submitRegister = useCallback(
    async (draft: BiometricDeviceFormState) => {
      if (!draft.deviceCode.trim() || !draft.deviceName.trim()) {
        toast('Device code and name are required.')
        return false
      }
      try {
        await register.registerDevice({
          deviceCode: draft.deviceCode.trim(),
          deviceName: draft.deviceName.trim(),
          location: draft.location.trim() || undefined,
          isActive: draft.isActive,
        }).unwrap()
        toast('Device onboarded.')
        refetchAll()
        return true
      } catch (error) {
        toast(getApiErrorMessage(error, 'Could not register device.'))
        return false
      }
    },
    [refetchAll, register, toast],
  )

  const submitUpdate = useCallback(
    async (device: BiometricDevice, draft: BiometricDeviceFormState) => {
      try {
        await update.updateDevice({
          id: device.id,
          body: {
            deviceName: draft.deviceName.trim(),
            location: draft.location.trim() || null,
            isActive: draft.isActive,
          },
        }).unwrap()
        toast('Device updated.')
        refetchAll()
        return true
      } catch (error) {
        toast(getApiErrorMessage(error, 'Could not update device.'))
        return false
      }
    },
    [refetchAll, toast, update],
  )

  return {
    perms,
    devices,
    timewatch,
    connection,
    canSync,
    syncLoading,
    registerLoading: register.isLoading,
    updateLoading: update.isLoading,
    runConnectionTest,
    runSync,
    submitRegister,
    submitUpdate,
    refetchAll,
  }
}