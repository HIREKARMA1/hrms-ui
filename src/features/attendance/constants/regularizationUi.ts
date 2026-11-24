/**
 * Labels for POST /attendance/employees/{id}/regularizations `type` values.
 */
import type { AttendanceRegularizationType } from './attendanceApiAccess'

export const REGULARIZATION_TYPE_OPTIONS: Array<{
  value: AttendanceRegularizationType
  label: string
}> = [
  { value: 'LATE_ARRIVAL', label: 'Late arrival' },
  { value: 'TEA_BREAK_EXCEEDED', label: 'Tea break exceeded' },
]