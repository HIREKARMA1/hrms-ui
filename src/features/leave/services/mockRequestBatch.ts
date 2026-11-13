/**
 * Bulk-generated mock leave requests to reach ~30 rows in the seed data.
 * Called from mockRequests.ts during store initialization.
 */

import type { LeaveRequest } from '../types/leaveRequest'
import { addDays } from '../utils/leaveDates'

function step(
  id: string,
  kind: LeaveRequest['steps'][0]['kind'],
  at: string,
  actorId: string,
  actorName: string,
) {
  return { id, kind, at, actorId, actorName }
}

export function buildMockRequestBatch(today: string): LeaveRequest[] {
  const employeeIds = [
    'EMP-1001', 'EMP-1002', 'EMP-1003', 'EMP-1004', 'EMP-1005', 'EMP-1006',
    'EMP-1007', 'EMP-1008', 'EMP-1009', 'EMP-1010', 'EMP-1011', 'EMP-1012',
  ]
  const items: LeaveRequest[] = []
  for (let index = 5; index <= 28; index++) {
    const status = index % 5 === 0 ? 'Rejected' : index % 4 === 0 ? 'Approved' : 'Pending'
    items.push({
      id: `LR-${String(index).padStart(3, '0')}`,
      employeeId: employeeIds[index % employeeIds.length],
      leaveTypeCode: index % 3 === 0 ? 'EL' : 'CL',
      fromDate: addDays(today, index % 7),
      toDate: addDays(today, (index % 7) + 1),
      days: 2,
      segments: [],
      reason: `Mock request ${index}`,
      appliedOn: addDays(today, -index % 6),
      status,
      currentLevel: status === 'Pending' ? (index % 2 ? 'Manager' : 'HR') : null,
      currentStepLabel: status === 'Pending' ? `Pending: ${index % 2 ? 'Manager' : 'HR'}` : status,
      escalated: index === 7,
      convertedToLwp: index === 12,
      lwpDays: index === 12 ? 1 : undefined,
      steps: [step(`Sx${index}`, 'applied', addDays(today, -1), 'EMP-1006', 'Applicant')],
    })
  }
  return items
}
