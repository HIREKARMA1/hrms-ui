/** Server permission codes for `/attendance/*` reports and regularisation (Swagger hirekarma). */

export const ATTENDANCE_REGULARIZE_PERMISSION = 'attendance:regularize' as const

/** Department-scoped attendance report for other employees. */
export const ATTENDANCE_REPORT_READ_PERMISSION = 'biometric:read_attendance' as const

/** Cross-department attendance reports (`AttendanceReportController` by id/code). */
export const ATTENDANCE_REPORT_READ_ALL_PERMISSION = 'biometric:read_all_attendance' as const

export const ATTENDANCE_REPORT_MAX_RANGE_DAYS = 31

export type AttendanceReportSource = 'auto' | 'live' | 'stored'

export type AttendanceRegularizationType = 'LATE_ARRIVAL' | 'TEA_BREAK_EXCEEDED'