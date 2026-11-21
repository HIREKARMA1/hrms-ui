/** Body for `POST /leaves` (LeavesController_apply). */
export type ApplyLeaveDayPortion = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'

export type ApplyLeaveRequestBody = {
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  dayPortion?: ApplyLeaveDayPortion
  reason?: string
}

/** UI payload from ApplyLeaveDialog before mapping to API body. */
export type ApplyLeaveFormInput = {
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  attachmentName?: string
  convertExtraToLwp?: boolean
  dayPortion?: ApplyLeaveDayPortion
}