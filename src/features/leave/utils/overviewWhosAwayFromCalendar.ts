import type { BackendLeaveCalendarItem } from '../api/leaveApi.types'

import {
  calendarItemFromDate,
  calendarItemToDate,
  calendarItemOverlapsDay,
} from './overviewFromLeaveCalendar'
import type { WhosAwayRow, WhosAwayWindow } from './overviewWhosAway'
import { addDays } from './leaveDates'
import { leaveTodayIso } from './leaveToday'

export function listWhosAwayFromCalendar(
  items: BackendLeaveCalendarItem[],
  window: WhosAwayWindow,
  options: {
    typeCodeById: Map<string, string>
    departmentByEmployeeId: Map<string, string>
    today?: string
  },
): WhosAwayRow[] {
  const today = options.today ?? leaveTodayIso()
  const end = window === 'today' ? today : addDays(today, window === 'next_7' ? 7 : 30)
  const rows: WhosAwayRow[] = []

  for (const item of items) {
    const from = calendarItemFromDate(item)
    const to = calendarItemToDate(item)
    if (window === 'today') {
      if (!calendarItemOverlapsDay(item, today)) continue
    } else if (from <= today || from > end) {
      continue
    }

    rows.push({
      requestId: item.id,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      department: options.departmentByEmployeeId.get(item.employeeId) ?? '—',
      leaveTypeCode: options.typeCodeById.get(item.leaveTypeId) ?? item.leaveTypeName,
      fromDate: from,
      toDate: to,
      backOn: addDays(to, 1),
    })
  }

  return rows.sort(
    (a, b) => a.fromDate.localeCompare(b.fromDate) || a.employeeName.localeCompare(b.employeeName),
  )
}