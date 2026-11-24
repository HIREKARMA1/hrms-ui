import type { BiometricAttendanceSource } from '../constants/biometricApiAccess'
import type { BiometricEmployeeAttendance, BiometricPunch } from '../types/api/biometricAttendance.types'
import { coerceOptionalString, pickItemsArray, unwrapRecord } from './biometricApiCoerce'

const SOURCES = new Set<string>(['auto', 'live', 'stored'])

function mapPunch(raw: unknown): BiometricPunch | null {
  const o = unwrapRecord(raw)
  const punchedAt =
    coerceOptionalString(o.punchedAt ?? o.punchTime ?? o.timestamp ?? o.checkTime ?? o.time) ??
    coerceOptionalString(o.date)
  if (!punchedAt) return null
  return {
    id: coerceOptionalString(o.id),
    punchedAt,
    direction: coerceOptionalString(o.direction ?? o.type ?? o.inOut) ?? null,
    deviceCode: coerceOptionalString(o.deviceCode ?? o.deviceId) ?? null,
    deviceUserId: coerceOptionalString(o.deviceUserId ?? o.userId) ?? null,
    source: coerceOptionalString(o.source),
  }
}

function coerceSource(value: unknown, fallback: BiometricAttendanceSource = 'auto'): string {
  const text = coerceOptionalString(value)
  return text && SOURCES.has(text) ? text : fallback
}

export function normalizeBiometricAttendance(raw: unknown): BiometricEmployeeAttendance {
  const root = unwrapRecord(raw)
  const punches = pickItemsArray(root.punches ?? root.items ?? root.records ?? raw)
    .map(mapPunch)
    .filter((item): item is BiometricPunch => item !== null)
  return {
    employeeId: coerceOptionalString(root.employeeId),
    employeeCode: coerceOptionalString(root.employeeCode ?? root.code),
    fromDate: coerceOptionalString(root.fromDate) ?? '',
    toDate: coerceOptionalString(root.toDate) ?? '',
    source: coerceSource(root.source),
    punches,
  }
}