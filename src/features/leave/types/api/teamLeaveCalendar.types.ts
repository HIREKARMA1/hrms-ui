/** Query for `GET /leaves/calendar` and `GET /leaves/calendar/team`. */
export type TeamLeaveCalendarQuery = {
  year: number
  /** 1–12 */
  month: number
}

export type ApiTeamCalendarDayRow = {
  id?: string
  date?: string
  day?: string
  calendarDate?: string
  employeeId?: string
  employeeName?: string
  employee?: {
    id?: string
    fullName?: string
    firstName?: string
    lastName?: string
  }
  leaveTypeCode?: string
  leaveType?: {
    code?: string
    name?: string
  }
  startDate?: string
  endDate?: string
  status?: string
}

export type TeamLeaveCalendarData = {
  items: ApiTeamCalendarDayRow[]
}