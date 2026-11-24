/**
 * Employee code + date range state for raw biometric punch lookup by code.
 */
import { useMemo, useState } from 'react'

import { sortBiometricPunches } from '@/features/biometric/components/biometricAttendanceUi'
import type { BiometricAttendanceSource } from '@/features/biometric/constants/biometricApiAccess'
import { useBiometricAttendanceByEmployeeCode } from '@/features/biometric/hooks'

import { useAttendanceReportRangeState } from './useAttendanceReportRangeState'

export function useBiometricAttendanceByCodeCard() {
  const [codeDraft, setCodeDraft] = useState('')
  const [activeCode, setActiveCode] = useState('')
  const { range, setRange, source, setSource, rangeError } = useAttendanceReportRangeState()
  const attendanceSource = source as BiometricAttendanceSource

  const trimmedCode = activeCode.trim()

  const query = useMemo(
    () => ({
      employeeCode: trimmedCode,
      fromDate: range.fromDate,
      toDate: range.toDate,
      source: attendanceSource,
    }),
    [trimmedCode, range.fromDate, range.toDate, attendanceSource],
  )

  const attendance = useBiometricAttendanceByEmployeeCode(query, {
    skip: Boolean(rangeError) || !trimmedCode,
  })

  const punches = useMemo(
    () => sortBiometricPunches(attendance.data?.punches ?? []),
    [attendance.data?.punches],
  )

  function runLookup() {
    const next = codeDraft.trim()
    if (!next) return
    setActiveCode(next)
    if (next === trimmedCode && !rangeError) {
      void attendance.refetch()
    }
  }

  return {
    codeDraft,
    setCodeDraft,
    trimmedCode,
    range,
    setRange,
    source,
    setSource,
    rangeError,
    attendance,
    punches,
    runLookup,
  }
}