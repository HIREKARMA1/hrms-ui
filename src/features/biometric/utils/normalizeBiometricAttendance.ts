import type { BiometricAttendanceSource } from '../constants/biometricApiAccess'
import type {
  BiometricAttendanceDay,
  BiometricAttendanceDevice,
  BiometricEmployeeAttendance,
  BiometricPunch,
} from '../types/api/biometricAttendance.types'
import { coerceOptionalString, pickItemsArray, unwrapRecord } from './biometricApiCoerce'

const SOURCES = new Set<string>(['auto', 'live', 'stored'])

function mapPunch(raw: unknown): BiometricPunch | null {
  const o = unwrapRecord(raw)
  const punchedAt =
    coerceOptionalString(o.punchedAt ?? o.punchTime ?? o.timestamp ?? o.checkTime ?? o.time) ??
    coerceOptionalString(o.date)
  if (!punchedAt) return null

  const direction =
    coerceOptionalString(o.direction ?? o.punchType ?? o.type ?? o.inOut) ?? null

  return {
    id: coerceOptionalString(o.id ?? o.sourceRowId),
    punchedAt,
    direction,
    deviceCode: coerceOptionalString(o.deviceCode ?? o.deviceId) ?? null,
    deviceUserId: coerceOptionalString(o.deviceUserId ?? o.userId) ?? null,
    source: coerceOptionalString(o.source),
    rawPunchType: coerceOptionalString(o.rawPunchType) ?? null,
    verifyMode: coerceOptionalString(o.verifyMode ?? o.verify_mode) ?? null,
  }
}

function mapDay(raw: unknown): BiometricAttendanceDay | null {
  const o = unwrapRecord(raw)
  const date = coerceOptionalString(o.date)
  if (!date) return null
  const punchCountRaw = o.punchCount
  const workedRaw = o.workedMinutes
  return {
    date,
    firstIn: coerceOptionalString(o.firstIn) ?? null,
    lastOut: coerceOptionalString(o.lastOut) ?? null,
    firstPunch: coerceOptionalString(o.firstPunch) ?? null,
    lastPunch: coerceOptionalString(o.lastPunch) ?? null,
    punchCount:
      typeof punchCountRaw === 'number'
        ? punchCountRaw
        : Number.parseInt(String(punchCountRaw ?? '0'), 10) || 0,
    workedMinutes:
      typeof workedRaw === 'number'
        ? workedRaw
        : Number.parseInt(String(workedRaw ?? '0'), 10) || 0,
  }
}

function mapDevice(raw: unknown): BiometricAttendanceDevice | null {
  if (!raw || typeof raw !== 'object') return null
  const o = unwrapRecord(raw)
  const deviceCode = coerceOptionalString(o.deviceCode ?? o.deviceId)
  if (!deviceCode && !coerceOptionalString(o.id)) return null
  return {
    id: coerceOptionalString(o.id),
    deviceCode: deviceCode ?? undefined,
    deviceName: coerceOptionalString(o.deviceName) ?? null,
    isActive: typeof o.isActive === 'boolean' ? o.isActive : undefined,
  }
}

function coerceSource(value: unknown, fallback: BiometricAttendanceSource = 'auto'): string {
  const text = coerceOptionalString(value)
  return text && SOURCES.has(text) ? text : fallback
}

export function normalizeBiometricAttendance(raw: unknown): BiometricEmployeeAttendance {
  const root = unwrapRecord(raw)
  const employee = unwrapRecord(root.employee)
  const punches = pickItemsArray(root.punches ?? root.items ?? root.records ?? raw)
    .map(mapPunch)
    .filter((item): item is BiometricPunch => item !== null)
  const days = pickItemsArray(root.days)
    .map(mapDay)
    .filter((item): item is BiometricAttendanceDay => item !== null)

  const deviceFromRoot = mapDevice(root.device)
  const deviceCodeFromEmployee = coerceOptionalString(employee.deviceId)
  const deviceUserId = coerceOptionalString(employee.deviceUserId)

  const punchesWithDevice = punches.map((punch) => ({
    ...punch,
    deviceCode: punch.deviceCode ?? deviceFromRoot?.deviceCode ?? deviceCodeFromEmployee ?? null,
    deviceUserId: punch.deviceUserId ?? deviceUserId ?? null,
  }))

  const fullName =
    coerceOptionalString(employee.fullName) ??
    [coerceOptionalString(employee.firstName), coerceOptionalString(employee.lastName)]
      .filter(Boolean)
      .join(' ')
      .trim()

  return {
    employeeId: coerceOptionalString(root.employeeId ?? employee.id),
    employeeCode: coerceOptionalString(
      root.employeeCode ?? employee.employeeCode ?? root.code,
    ),
    employeeName: fullName || null,
    fromDate: coerceOptionalString(root.fromDate) ?? '',
    toDate: coerceOptionalString(root.toDate) ?? '',
    timezone: coerceOptionalString(root.timezone) ?? null,
    source: coerceSource(root.source),
    truncated: root.truncated === true,
    device: deviceFromRoot,
    punches: punchesWithDevice,
    days,
  }
}
