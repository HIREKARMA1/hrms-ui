import type { BiometricAttendanceSource } from '../constants/biometricApiAccess'
import type { BiometricPunch } from '../types/api/biometricAttendance.types'

export const BIOMETRIC_ATTENDANCE_SOURCE_OPTIONS: {
  value: BiometricAttendanceSource
  label: string
}[] = [
  { value: 'auto', label: 'Auto (stored, else live)' },
  { value: 'stored', label: 'Stored in HRMS' },
  { value: 'live', label: 'Live from TimeWatch' },
]

export function formatBiometricPunchTime(value: string): string {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString()
  return value
}

export function sortBiometricPunches(punches: BiometricPunch[]): BiometricPunch[] {
  return [...punches].sort((a, b) => b.punchedAt.localeCompare(a.punchedAt))
}