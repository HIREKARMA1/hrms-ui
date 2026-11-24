import type { AttendanceReportSource } from '../constants/attendanceApiAccess'
import type { AttendanceDayRecord, AttendanceReportResult } from '../types/api/attendanceReport.types'
import { coerceOptionalString, pickItemsArray, unwrapRecord } from '@/features/biometric/utils/biometricApiCoerce'

import { mapAttendanceReportDay } from './mapAttendanceReportDay'
import {
  mapAttendanceReportEmployee,
  mapAttendanceReportPolicy,
  mapAttendanceReportSummary,
} from './normalizeAttendanceReportMeta'

const SOURCES = new Set<string>(['auto', 'live', 'stored'])

function coerceSource(value: unknown): AttendanceReportSource | string {
  const text = coerceOptionalString(value)
  return text && SOURCES.has(text) ? (text as AttendanceReportSource) : 'auto'
}

function pickReportDays(body: Record<string, unknown>): unknown[] {
  const report = unwrapRecord(body.report)
  const inline = body.days ?? body.records ?? body.items ?? body.attendanceDays ?? body.dailyRecords
  if (inline !== undefined) return pickItemsArray(inline)
  const nested =
    report.days ?? report.records ?? report.items ?? report.attendanceDays ?? report.dailyRecords
  if (nested !== undefined) return pickItemsArray(nested)
  return []
}

export function normalizeAttendanceReport(raw: unknown): AttendanceReportResult {
  const root = unwrapRecord(raw)
  const nested = unwrapRecord(root.data)
  const body = Object.keys(nested).length ? nested : root
  const employee = unwrapRecord(body.employee)
  const days = pickReportDays(body)
    .map(mapAttendanceReportDay)
    .filter((item): item is AttendanceDayRecord => item !== null)
  const singleDay = mapAttendanceReportDay(body)
  const mergedDays = days.length ? days : singleDay ? [singleDay] : []
  const employeeSnap = mapAttendanceReportEmployee(employee)

  return {
    employeeId: coerceOptionalString(body.employeeId ?? employee.id ?? employeeSnap?.id),
    employeeCode: coerceOptionalString(body.employeeCode ?? body.code ?? employee.employeeCode ?? employeeSnap?.employeeCode),
    fromDate: coerceOptionalString(body.fromDate),
    toDate: coerceOptionalString(body.toDate),
    date: coerceOptionalString(body.date),
    source: coerceSource(body.source),
    timezone: coerceOptionalString(body.timezone),
    fallbackReason: coerceOptionalString(body.fallbackReason),
    truncated: body.truncated === true,
    employee: employeeSnap,
    summary: mapAttendanceReportSummary(body.summary),
    policy: mapAttendanceReportPolicy(body.policy),
    days: mergedDays,
  }
}