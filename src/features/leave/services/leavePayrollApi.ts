/**
 * The single place payroll reads leave data from. Do not import payroll code here.
 */

import { getLeaveStore } from './mockLeaveStore'
import { yearMonthFromIso } from '../utils/leaveDates'

export async function getApprovedUnpaidLeaveDays(
  employeeId: string,
  yearMonth: string,
): Promise<number> {
  const { requests } = getLeaveStore()
  return requests
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.status === 'Approved' &&
        (item.leaveTypeCode === 'LWP' || (item.lwpDays ?? 0) > 0),
    )
    .reduce((sum, item) => {
      const inMonth =
        yearMonthFromIso(item.fromDate) === yearMonth ||
        yearMonthFromIso(item.toDate) === yearMonth
      if (!inMonth) {
        return sum
      }
      const lwp = item.leaveTypeCode === 'LWP' ? item.days : item.lwpDays ?? 0
      return sum + lwp
    }, 0)
}

export async function getEncashableLeaveDays(employeeId: string): Promise<number> {
  const { settings, ledger } = getLeaveStore()
  const encashable = settings.leaveTypes.filter((item) => item.encashable).map((item) => item.code)
  return ledger
    .filter((item) => item.employeeId === employeeId && encashable.includes(item.leaveTypeCode))
    .reduce((max, item) => Math.max(max, item.balanceAfter), 0)
}

export async function getPendingEncashmentDays(
  employeeId: string,
  yearMonth: string,
): Promise<number> {
  const { encashments } = getLeaveStore()
  return encashments
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.status === 'Pending payout' &&
        (item.approvedOn ? yearMonthFromIso(item.approvedOn) === yearMonth : false),
    )
    .reduce((sum, item) => sum + item.days, 0)
}
