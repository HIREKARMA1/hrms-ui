import type { HrLookupMode } from '../hooks/useHrAttendanceReportActive'

export type HrAttendanceReportPreset = {
  mode: HrLookupMode
  employeeCode: string
  employeeId: string
  autoLoad?: boolean
}