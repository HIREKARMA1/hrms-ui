import type { OnLeaveTodayItem } from '@/features/employees/api/employeeDashboardApi.types'

import { addDays } from './leaveDates'
import type { WhosAwayRow } from './overviewWhosAway'

/** Map dashboard on-leave rows for the Overview "Today" window. */
export function whosAwayTodayFromOnLeave(items: OnLeaveTodayItem[]): WhosAwayRow[] {
  return items
    .map((item) => ({
      requestId: item.leaveRequestId,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      department: item.department?.name?.trim() || 'Unassigned',
      leaveTypeCode: item.leaveType.code,
      fromDate: item.startDate.slice(0, 10),
      toDate: item.endDate.slice(0, 10),
      backOn: addDays(item.endDate.slice(0, 10), 1),
    }))
    .sort(
      (a, b) =>
        a.fromDate.localeCompare(b.fromDate) || a.employeeName.localeCompare(b.employeeName),
    )
}