/**
 * Shared date range + source state for processed attendance report UIs.
 */
import { useState } from 'react'

import {
  defaultBiometricAttendanceRange,
  validateBiometricDateRange,
} from '@/features/biometric/utils/biometricAttendanceDates'

import type { AttendanceReportSource } from '../constants/attendanceApiAccess'
import { DEFAULT_ATTENDANCE_REPORT_SOURCE } from '../constants/attendanceReportSourceOptions'

export type AttendanceReportRangeState = {
  fromDate: string
  toDate: string
}

export function useAttendanceReportRangeState() {
  const [range, setRange] = useState<AttendanceReportRangeState>(() => defaultBiometricAttendanceRange())
  const [source, setSource] = useState<AttendanceReportSource>(DEFAULT_ATTENDANCE_REPORT_SOURCE)
  const rangeError = validateBiometricDateRange(range.fromDate, range.toDate)
  const singleDay = range.fromDate === range.toDate && Boolean(range.fromDate)

  return { range, setRange, source, setSource, rangeError, singleDay }
}