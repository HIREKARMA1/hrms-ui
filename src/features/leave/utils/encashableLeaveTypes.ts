import type { LeaveTypeOption } from '../api/leaveMappers'

/** Paid, active leave types allowed for encashment policies and employee requests. */
export function encashableLeaveTypes(types: LeaveTypeOption[]): LeaveTypeOption[] {
  return types.filter((type) => type.isActive && type.isPaid)
}