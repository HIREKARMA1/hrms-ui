import type { AttendanceDayRecord, AttendanceReportDayPunch } from '../types/api/attendanceReport.types'
import { mapDayBreakFields } from './mapAttendanceReportBreaks'
import {
  coerceNumber,
  coerceOptionalString,
  pickItemsArray,
  unwrapRecord,
} from '@/features/biometric/utils/biometricApiCoerce'

function firstString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = coerceOptionalString(source[key])
    if (value) return value
  }
  return undefined
}

function firstNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = coerceNumber(source[key])
    if (value !== undefined) return value
  }
  return undefined
}

function mapPunch(raw: unknown): AttendanceReportDayPunch | null {
  const o = unwrapRecord(raw)
  const punchTime = firstString(o, ['punchTime', 'punchedAt', 'timestamp', 'time'])
  if (!punchTime) return null
  return {
    punchTime,
    punchType: firstString(o, ['punchType', 'direction', 'type']) ?? null,
    rawPunchType: firstString(o, ['rawPunchType']) ?? null,
    verifyMode: firstString(o, ['verifyMode']) ?? null,
    sourceRowId: firstString(o, ['sourceRowId', 'id']) ?? null,
  }
}

function mapDayContext(o: Record<string, unknown>): string | null {
  const holiday = unwrapRecord(o.holiday)
  const weeklyOff = unwrapRecord(o.weeklyOff)
  const leave = unwrapRecord(o.leave)
  const holidayName = firstString(holiday, ['name', 'title'])
  if (holidayName) return holidayName
  const weeklyRule = firstString(weeklyOff, ['rule', 'description'])
  if (weeklyRule) return weeklyRule
  const leaveType = firstString(leave, ['type', 'leaveType', 'name'])
  if (leaveType) return leaveType
  return null
}

function mapStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => coerceOptionalString(item))
    .filter((item): item is string => Boolean(item))
}

export function mapAttendanceReportDay(raw: unknown): AttendanceDayRecord | null {
  const o = unwrapRecord(raw)
  const date =
    firstString(o, ['date', 'attendanceDate', 'day', 'workDate']) ??
    firstString(unwrapRecord(o.day), ['date', 'attendanceDate'])
  if (!date) return null

  const netWorked = firstNumber(o, ['netWorkedMinutes', 'workingMinutes', 'workedMinutes', 'grossMinutes'])
  const late = firstNumber(o, ['lateByMinutes', 'lateMinutes', 'late', 'lateArrivalMinutes'])

  return {
    date,
    weekday: firstString(o, ['weekday']),
    rawStatus: firstString(o, ['rawStatus']),
    status: firstString(o, ['status', 'attendanceStatus', 'dayStatus']),
    displayState: firstString(o, ['displayState', 'state', 'regularizationDisplayState']),
    isRegularised: o.isRegularised === true,
    flags: mapStringList(o.flags),
    issues: mapStringList(o.issues),
    checkIn:
      firstString(o, ['firstIn', 'checkIn', 'checkInTime', 'inTime', 'firstInTime', 'in']) ?? null,
    checkOut:
      firstString(o, ['lastOut', 'checkOut', 'checkOutTime', 'outTime', 'lastOutTime', 'out']) ??
      null,
    workingMinutes: netWorked,
    grossMinutes: firstNumber(o, ['grossMinutes']),
    lateMinutes: late,
    lateAfterGraceMinutes: firstNumber(o, ['lateAfterGraceMinutes']),
    earlyLeaveByMinutes: firstNumber(o, ['earlyLeaveByMinutes']),
    lunchMinutes: firstNumber(o, ['lunchMinutes', 'lunch']),
    teaMinutes: firstNumber(o, ['teaMinutes', 'tea']),
    overtimeMinutes: firstNumber(o, ['overtimeMinutes', 'overtime', 'otMinutes']),
    dayContext: mapDayContext(o),
    ...mapDayBreakFields(o),
    punches: pickItemsArray(o.punches)
      .map(mapPunch)
      .filter((item): item is AttendanceReportDayPunch => item !== null),
    source: firstString(o, ['source', 'dataSource']),
  }
}