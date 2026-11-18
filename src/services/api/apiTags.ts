/**
 * RTK Query cache tags. Add a tag here when a new module needs
 * `providesTags` / `invalidatesTags`.
 */
export const API_TAGS = [
  'Auth',
  'User',
  'Role',
  'Employee',
  'Leave',
  'Attendance',
  'Holiday',
  'Lead',
] as const

export type ApiTag = (typeof API_TAGS)[number]
