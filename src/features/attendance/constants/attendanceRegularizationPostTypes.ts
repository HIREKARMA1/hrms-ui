/**
 * Legacy / documented enum subset. Create regularization accepts attendance report issue codes
 * (same as Reports → Issues). List filter may still use these known values.
 */
export const ATTENDANCE_REGULARIZATION_POST_TYPES = ['LATE_ARRIVAL', 'TEA_BREAK_EXCEEDED'] as const

export type AttendanceRegularizationPostType = (typeof ATTENDANCE_REGULARIZATION_POST_TYPES)[number]

export function isAttendanceRegularizationPostType(value: string): value is AttendanceRegularizationPostType {
  return (ATTENDANCE_REGULARIZATION_POST_TYPES as readonly string[]).includes(value)
}