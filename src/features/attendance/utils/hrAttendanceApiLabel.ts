/**
 * Describes which HR attendance report endpoint matches the current lookup.
 */
import type { HrActiveLookup, HrLookupMode } from '../hooks/useHrAttendanceReportActive'

export function hrAttendanceApiLabel(
  activeLookup: HrActiveLookup | null,
  singleDay: boolean,
): string {
  const mode: HrLookupMode = activeLookup?.mode ?? 'code'
  if (mode === 'code') {
    return singleDay
      ? 'GET /attendance/employees/by-code/{code}/date/{date}'
      : 'GET /attendance/employees/by-code/{code}'
  }
  return singleDay
    ? 'GET /attendance/employees/{employeeId}/date/{date}'
    : 'GET /attendance/employees/{employeeId}'
}