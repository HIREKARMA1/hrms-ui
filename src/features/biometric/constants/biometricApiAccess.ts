/** Backend permission codes for `/attendance/biometric/*` (match server seed). */

/** List/register/update TimeWatch devices (matches `hrms-server` seed). */
export const BIOMETRIC_MANAGE_DEVICES_PERMISSION = 'biometric:manage_devices' as const
export const BIOMETRIC_SYNC_PERMISSION = 'biometric:sync' as const
export const BIOMETRIC_READ_ATTENDANCE_PERMISSION = 'biometric:read_attendance' as const

/** Cross-department punch visibility on raw biometric attendance endpoints. */
export const BIOMETRIC_READ_ALL_ATTENDANCE_PERMISSION = 'biometric:read_all_attendance' as const

export const BIOMETRIC_ATTENDANCE_MAX_RANGE_DAYS = 31

export type BiometricAttendanceSource = 'auto' | 'live' | 'stored'