import type { AttendanceReportSource } from '../constants/attendanceApiAccess'
import type { AttendanceDayRecord, AttendanceReportResult } from '../types/api/attendanceReport.types'
import {
  coerceNumber,
  coerceOptionalString,
  pickItemsArray,
  unwrapRecord,
} from '@/features/biometric/utils/biometricApiCoerce'

const SOURCES = new Set<string>(['auto', 'live', 'stored'])

function coerceSource(value: unknown): AttendanceReportSource | string {
  const text = coerceOptionalString(value)
  return text && SOURCES.has(text) ? (text as AttendanceReportSource) : 'auto'
}

function mapDay(raw: unknown): AttendanceDayRecord | null {
  const o = unwrapRecord(raw)
  const date =
    coerceOptionalString(o.date ?? o.attendanceDate ?? o.day) ??
    coerceOptionalString(o.workDate)
  if (!date) return null
  return {
    date,
    status: coerceOptionalString(o.status ?? o.attendanceStatus),
    displayState: coerceOptionalString(o.displayState ?? o.state),
    checkIn: coerceOptionalString(o.checkIn ?? o.inTime ?? o.firstIn) ?? null,
    checkOut: coerceOptionalString(o.checkOut ?? o.outTime ?? o.lastOut) ?? null,
    lateMinutes: coerceNumber(o.lateMinutes ?? o.late),
    lunchMinutes: coerceNumber(o.lunchMinutes),
    teaMinutes: coerceNumber(o.teaMinutes),
    overtimeMinutes: coerceNumber(o.overtimeMinutes ?? o.overtime),
    workingMinutes: coerceNumber(o.workingMinutes ?? o.workedMinutes),
    source: coerceOptionalString(o.source),
  }
}

export function normalizeAttendanceReport(raw: unknown): AttendanceReportResult {
  const root = unwrapRecord(raw)
  const nested = unwrapRecord(root.data)
  const body = Object.keys(nested).length ? nested : root
  const days = pickItemsArray(body.days ?? body.records ?? body.items ?? raw)
    .map(mapDay)
    .filter((item): item is AttendanceDayRecord => item !== null)
  const singleDay = mapDay(body)
  const mergedDays = days.length ? days : singleDay ? [singleDay] : []
  return {
    employeeId: coerceOptionalString(body.employeeId ?? body.employee?.id),
    employeeCode: coerceOptionalString(body.employeeCode ?? body.code ?? body.employee?.employeeCode),
    fromDate: coerceOptionalString(body.fromDate),
    toDate: coerceOptionalString(body.toDate),
    date: coerceOptionalString(body.date),
    source: coerceSource(body.source),
    days: mergedDays,
  }
}