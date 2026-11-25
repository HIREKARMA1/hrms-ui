import type {
  AttendanceReportLunchBreak,
  AttendanceReportTeaBreak,
} from '../types/api/attendanceReportBreak.types'
import { coerceNumber, coerceOptionalString, unwrapRecord } from '@/features/biometric/utils/biometricApiCoerce'

function mapLunchBreak(raw: unknown): AttendanceReportLunchBreak | null {
  const o = unwrapRecord(raw)
  if (!Object.keys(o).length) return null
  return {
    outTime: coerceOptionalString(o.outTime),
    inTime: coerceOptionalString(o.inTime),
    durationMinutes: coerceNumber(o.durationMinutes),
    earlyOutMinutes: coerceNumber(o.earlyOutMinutes),
    lateInMinutes: coerceNumber(o.lateInMinutes),
    exceededMinutes: coerceNumber(o.exceededMinutes),
    isExceeded: o.isExceeded === true ? true : undefined,
  }
}

function mapTeaBreak(raw: unknown): AttendanceReportTeaBreak | null {
  const o = unwrapRecord(raw)
  if (!Object.keys(o).length) return null
  return {
    outTime: coerceOptionalString(o.outTime),
    inTime: coerceOptionalString(o.inTime),
    durationMinutes: coerceNumber(o.durationMinutes),
    exceededMinutes: coerceNumber(o.exceededMinutes),
    isExceeded: o.isExceeded === true ? true : undefined,
  }
}

export function mapDayBreakFields(o: Record<string, unknown>) {
  const lunch = o.lunchBreak != null ? mapLunchBreak(o.lunchBreak) : null
  const tea = o.teaBreak != null ? mapTeaBreak(o.teaBreak) : null
  return {
    lunchBreak: lunch,
    teaBreak: tea,
    halfDaySession: coerceOptionalString(o.halfDaySession) ?? null,
    otherBreakMinutes: coerceNumber(o.otherBreakMinutes),
  }
}