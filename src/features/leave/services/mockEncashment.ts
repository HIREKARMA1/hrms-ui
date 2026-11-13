/**
 * Sample encashment requests in approval and payout stages for HR views.
 * Loaded by mockLeaveStore and leavePayrollApi pending payout helper.
 */

import type { EncashmentRequest } from '../types/encashment'
import { leaveTodayIso } from '../utils/leaveToday'
import { addDays } from '../utils/leaveDates'

export function buildMockEncashment(): EncashmentRequest[] {
  const today = leaveTodayIso()
  return [
    {
      id: 'ENC-1',
      employeeId: 'EMP-1011',
      leaveTypeCode: 'EL',
      days: 5,
      appliedOn: addDays(today, -20),
      status: 'Pending payout',
      approvedOn: addDays(today, -15),
    },
    {
      id: 'ENC-2',
      employeeId: 'EMP-1008',
      leaveTypeCode: 'EL',
      days: 3,
      appliedOn: addDays(today, -3),
      status: 'Pending approval',
    },
  ]
}
