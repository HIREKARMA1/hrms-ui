/**

 * RBAC sidebar children for Office Calendar.

 */



import type { UserRole } from '@/features/leave/constants/userRoles'

import { calendarNavChildrenForRole } from '@/features/officeCalendar/utils/officeCalendarSectionRoutes'



import type { BackendRoleCode, RoleNavChild } from '../types/roles'



export function calendarNavChildrenForRbac(

  roleCode: BackendRoleCode,

  routePrefix: string,

): RoleNavChild[] {

  const role = roleCode as UserRole

  return calendarNavChildrenForRole(role, `${routePrefix}/calendar`)

}



export function employeeCalendarNavChildren(): RoleNavChild[] {

  return calendarNavChildrenForRole('EMPLOYEE', '/employee/calendar')

}
