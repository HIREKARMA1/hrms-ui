import type { TimeWatchDevice, TimeWatchDeviceListResult } from '../types/api/biometricDevices.types'
import { coerceOptionalString, pickItemsArray, unwrapRecord } from './biometricApiCoerce'

export function normalizeTimeWatchDevice(raw: unknown): TimeWatchDevice | null {
  if (typeof raw === 'string') {
    const code = raw.trim()
    return code ? { deviceCode: code } : null
  }
  const o = unwrapRecord(raw)
  const deviceCode = coerceOptionalString(o.deviceCode ?? o.deviceId ?? o.id ?? o.serial)
  if (!deviceCode) return null
  return {
    deviceCode,
    deviceName: coerceOptionalString(o.deviceName ?? o.name),
    location: coerceOptionalString(o.location) ?? null,
  }
}

export function normalizeTimeWatchDeviceList(raw: unknown): TimeWatchDeviceListResult {
  const root = unwrapRecord(raw)
  const source = pickItemsArray(raw).length ? pickItemsArray(raw) : pickItemsArray(root.timewatchDevices)
  const items = source
    .map(normalizeTimeWatchDevice)
    .filter((item): item is TimeWatchDevice => item !== null)
  return { items }
}