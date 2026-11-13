/**
 * Comp-off lots and pending earn requests including one near-expiry lot.
 * Seeded into mockLeaveStore for My Leave and approval flows.
 */

import type { CompOffLot, CompOffRequest } from '../types/compOff'
import { leaveTodayIso } from '../utils/leaveToday'
import { addDays } from '../utils/leaveDates'

export function buildMockCompOff(): { lots: CompOffLot[]; requests: CompOffRequest[] } {
  const today = leaveTodayIso()
  const lots: CompOffLot[] = [
    {
      id: 'CO-LOT-1',
      employeeId: 'EMP-1006',
      workedDate: addDays(today, -40),
      dayType: 'full',
      creditedDays: 1,
      expiresOn: addDays(today, 10),
      status: 'Available',
      createdOn: addDays(today, -38),
    },
    {
      id: 'CO-LOT-2',
      employeeId: 'EMP-1006',
      workedDate: addDays(today, -90),
      dayType: 'half',
      creditedDays: 0.5,
      expiresOn: addDays(today, 45),
      status: 'Available',
      createdOn: addDays(today, -88),
    },
  ]
  const requests: CompOffRequest[] = [
    {
      id: 'CO-REQ-1',
      employeeId: 'EMP-1010',
      workedDate: addDays(today, -7),
      dayType: 'full',
      reason: 'Deployed release on weekly off.',
      appliedOn: addDays(today, -5),
      status: 'Pending',
    },
  ]
  return { lots, requests }
}
