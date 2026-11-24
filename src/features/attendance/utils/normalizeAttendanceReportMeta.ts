import type {
  AttendanceReportEmployeeSnapshot,
  AttendanceReportSummary,
} from '../types/api/attendanceReport.types'
import { coerceNumber, coerceOptionalString, unwrapRecord } from '@/features/biometric/utils/biometricApiCoerce'

export function mapAttendanceReportEmployee(raw: unknown): AttendanceReportEmployeeSnapshot | undefined {
  const o = unwrapRecord(raw)
  if (!Object.keys(o).length) return undefined
  return {
    id: coerceOptionalString(o.id),
    employeeCode: coerceOptionalString(o.employeeCode),
    fullName: coerceOptionalString(o.fullName ?? o.name),
    designation: coerceOptionalString(o.designation),
    deviceId: coerceOptionalString(o.deviceId),
    deviceUserId: coerceOptionalString(o.deviceUserId),
  }
}

export function mapAttendanceReportSummary(raw: unknown): AttendanceReportSummary | undefined {
  const o = unwrapRecord(raw)
  if (!Object.keys(o).length) return undefined
  const read = (key: string) => coerceNumber(o[key])
  return {
    presentDays: read('presentDays'),
    lateDays: read('lateDays'),
    halfDays: read('halfDays'),
    earlyLeaveDays: read('earlyLeaveDays'),
    absentDays: read('absentDays'),
    missedPunchDays: read('missedPunchDays'),
    leaveDays: read('leaveDays'),
    holidayDays: read('holidayDays'),
    weeklyOffDays: read('weeklyOffDays'),
    totalWorkedMinutes: read('totalWorkedMinutes'),
    totalOvertimeMinutes: read('totalOvertimeMinutes'),
    totalLateMinutes: read('totalLateMinutes'),
  }
}

export function mapAttendanceReportPolicy(raw: unknown): Record<string, string | number | boolean> | undefined {
  const o = unwrapRecord(raw)
  if (!Object.keys(o).length) return undefined
  const policy: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(o)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      policy[key] = value
    }
  }
  return Object.keys(policy).length ? policy : undefined
}