/**
 * RTK Query cache tags. Add a tag here when a new module needs
 * `providesTags` / `invalidatesTags`.
 */
export const API_TAGS = [
  'Auth',
  'User',
  'Role',
  'Employee',
  'Department',
  'Leave',
  'Attendance',
  'Holiday',
  'CalendarEvent',
  'WeeklyOff',
  'Lead',
  'Dashboard',
] as const

export type ApiTag = (typeof API_TAGS)[number]
