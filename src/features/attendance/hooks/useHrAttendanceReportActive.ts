/**
 * HR employee report: by-code or by-id, range or single-day (APIs 3–6).
 */
import { useMemo, useState } from 'react'

import {
  useAttendanceReportByEmployeeCode,
  useAttendanceReportByEmployeeCodeForDate,
  useAttendanceReportByEmployeeId,
  useAttendanceReportByEmployeeIdForDate,
} from './useAttendanceReportQueries'
import { sortAttendanceReportDays } from '../utils/sortAttendanceReportDays'
import type { AttendanceReportSource } from '../constants/attendanceApiAccess'
import type { AttendanceReportRangeState } from './useAttendanceReportRangeState'

export type HrLookupMode = 'code' | 'id'

export type HrActiveLookup = {
  mode: HrLookupMode
  employeeCode: string
  employeeId: string
}

export function useHrAttendanceReportActive(
  range: AttendanceReportRangeState,
  source: AttendanceReportSource,
  rangeError: string | null,
  singleDay: boolean,
) {
  const [activeLookup, setActiveLookup] = useState<HrActiveLookup | null>(null)
  const lookupReady = Boolean(activeLookup)

  const codeRange = useAttendanceReportByEmployeeCode(
    {
      employeeCode: activeLookup?.employeeCode ?? '',
      fromDate: range.fromDate,
      toDate: range.toDate,
      source,
    },
    {
      skip:
        !lookupReady ||
        activeLookup?.mode !== 'code' ||
        singleDay ||
        Boolean(rangeError) ||
        !activeLookup?.employeeCode,
    },
  )

  const codeDay = useAttendanceReportByEmployeeCodeForDate(
    {
      employeeCode: activeLookup?.employeeCode ?? '',
      date: range.fromDate,
      source,
    },
    {
      skip:
        !lookupReady ||
        activeLookup?.mode !== 'code' ||
        !singleDay ||
        Boolean(rangeError) ||
        !activeLookup?.employeeCode,
    },
  )

  const idRange = useAttendanceReportByEmployeeId(
    {
      employeeId: activeLookup?.employeeId ?? '',
      fromDate: range.fromDate,
      toDate: range.toDate,
      source,
    },
    {
      skip:
        !lookupReady ||
        activeLookup?.mode !== 'id' ||
        singleDay ||
        Boolean(rangeError) ||
        !activeLookup?.employeeId,
    },
  )

  const idDay = useAttendanceReportByEmployeeIdForDate(
    {
      employeeId: activeLookup?.employeeId ?? '',
      date: range.fromDate,
      source,
    },
    {
      skip:
        !lookupReady ||
        activeLookup?.mode !== 'id' ||
        !singleDay ||
        Boolean(rangeError) ||
        !activeLookup?.employeeId,
    },
  )

  const active =
    activeLookup?.mode === 'code' ? (singleDay ? codeDay : codeRange) : singleDay ? idDay : idRange

  const days = useMemo(() => sortAttendanceReportDays(active.data?.days), [active.data?.days])

  const submitLookup = (mode: HrLookupMode, employeeCode: string, employeeId: string) => {
    const code = employeeCode.trim()
    const id = employeeId.trim()
    if (mode === 'code') {
      if (!code) return
      setActiveLookup({ mode: 'code', employeeCode: code, employeeId: '' })
      return
    }
    if (!id) return
    setActiveLookup({ mode: 'id', employeeCode: '', employeeId: id })
  }

  return { active, days, activeLookup, lookupReady, submitLookup }
}