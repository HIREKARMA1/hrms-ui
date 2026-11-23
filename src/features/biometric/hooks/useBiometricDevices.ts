import type { BiometricDeviceListQuery } from '../types/api/biometricDevices.types'
import {
  useListBiometricDevicesQuery,
  useListTimeWatchDevicesQuery,
  useBiometricConnectionTestQuery,
  useRegisterBiometricDeviceMutation,
  useUpdateBiometricDeviceMutation,
} from '../api/biometricApi'
import { useBiometricPermissions } from './useBiometricPermissions'

export function useBiometricDeviceList(query: BiometricDeviceListQuery = {}) {
  const { canListDevices } = useBiometricPermissions()
  return useListBiometricDevicesQuery(query, { skip: !canListDevices })
}

export function useTimeWatchDeviceCatalog() {
  const { canListDevices } = useBiometricPermissions()
  return useListTimeWatchDevicesQuery(undefined, { skip: !canListDevices })
}

export function useBiometricConnectionTest(options?: { skip?: boolean }) {
  const { canListDevices } = useBiometricPermissions()
  return useBiometricConnectionTestQuery(undefined, {
    skip: options?.skip ?? !canListDevices,
  })
}

export function useRegisterBiometricDevice() {
  const { canConfigureDevices } = useBiometricPermissions()
  const [mutate, state] = useRegisterBiometricDeviceMutation()
  return {
    registerDevice: mutate,
    canRegister: canConfigureDevices,
    ...state,
  }
}

export function useUpdateBiometricDevice() {
  const { canConfigureDevices } = useBiometricPermissions()
  const [mutate, state] = useUpdateBiometricDeviceMutation()
  return {
    updateDevice: mutate,
    canUpdate: canConfigureDevices,
    ...state,
  }
}