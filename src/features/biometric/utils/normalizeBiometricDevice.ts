import type {
  BiometricDevice,
  BiometricDeviceListResult,
} from '../types/api/biometricDevices.types'
import {
  coerceBoolean,
  coerceNumber,
  coerceOptionalString,
  pickItemsArray,
  unwrapRecord,
} from './biometricApiCoerce'

function mapDevice(raw: unknown): BiometricDevice | null {
  const o = unwrapRecord(raw)
  const id = coerceOptionalString(o.id)
  const deviceCode = coerceOptionalString(o.deviceCode ?? o.deviceId)
  const deviceName = coerceOptionalString(o.deviceName ?? o.name)
  if (!id || !deviceCode || !deviceName) return null
  return {
    id,
    deviceCode,
    deviceName,
    location: coerceOptionalString(o.location) ?? null,
    isActive: coerceBoolean(o.isActive, true),
    lastSyncCursor: coerceOptionalString(o.lastSyncCursor ?? o.syncCursor) ?? null,
    lastSyncedAt: coerceOptionalString(o.lastSyncedAt ?? o.lastSynced) ?? null,
  }
}

export function normalizeBiometricDevice(raw: unknown): BiometricDevice {
  const mapped = mapDevice(raw)
  if (mapped) return mapped
  const id = coerceOptionalString(unwrapRecord(raw).id) ?? 'unknown'
  return {
    id,
    deviceCode: id,
    deviceName: 'Device',
    isActive: true,
  }
}

export function normalizeBiometricDeviceList(raw: unknown): BiometricDeviceListResult {
  const root = unwrapRecord(raw)
  const pagination = unwrapRecord(root.pagination)
  const items = pickItemsArray(raw).map(normalizeBiometricDevice)
  return {
    items,
    page: coerceNumber(root.page ?? pagination.page),
    limit: coerceNumber(root.limit ?? pagination.limit),
    total: coerceNumber(root.total ?? pagination.total),
    totalPages: coerceNumber(root.totalPages ?? pagination.totalPages),
  }
}