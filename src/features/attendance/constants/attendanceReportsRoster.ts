/** Attendance Reports employee roster list sizing and search timing. */
import { EMPLOYEE_MAX_TAKE } from '@/features/employees/api/employeesApi'

export const ATTENDANCE_ROSTER_SEARCH_DEBOUNCE_MS = 350
export const ATTENDANCE_ROSTER_PAGE_SIZE = Math.min(50, EMPLOYEE_MAX_TAKE)