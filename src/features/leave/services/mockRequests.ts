/**
 * ~30 varied leave requests across statuses for demos and approvals.
 * Seeded once into mockLeaveStore; mutations happen via requestService.
 */

import type { LeaveRequest } from '../types/leaveRequest'
import { HR_DEMO_USER_NAME } from '../constants/leaveRules'
import { addDays } from '../utils/leaveDates'
import { buildMockRequestBatch } from './mockRequestBatch'

function step(
  id: string,
  kind: LeaveRequest['steps'][0]['kind'],
  at: string,
  actorId: string,
  actorName: string,
  patch: Partial<LeaveRequest['steps'][0]> = {},
) {
  return { id, kind, at, actorId, actorName, ...patch }
}

export function buildMockRequests(today: string): LeaveRequest[] {
  const items: LeaveRequest[] = []
  const push = (row: LeaveRequest) => items.push(row)

  push({
    id: 'LR-001',
    employeeId: 'EMP-1006',
    leaveTypeCode: 'CL',
    fromDate: addDays(today, 5),
    toDate: addDays(today, 6),
    days: 2,
    segments: [],
    reason: 'Family visit',
    appliedOn: addDays(today, -1),
    status: 'Pending',
    currentLevel: 'Manager',
    currentStepLabel: 'Pending: Manager',
    escalated: false,
    steps: [step('S1', 'applied', addDays(today, -1), 'EMP-1006', 'Arjun Das')],
  })

  push({
    id: 'LR-002',
    employeeId: 'EMP-1006',
    leaveTypeCode: 'EL',
    fromDate: addDays(today, -10),
    toDate: addDays(today, -8),
    days: 3,
    segments: [],
    reason: 'Personal',
    appliedOn: addDays(today, -15),
    status: 'Approved',
    currentLevel: null,
    currentStepLabel: 'Approved',
    escalated: false,
    steps: [
      step('S2a', 'applied', addDays(today, -15), 'EMP-1006', 'Arjun Das'),
      step('S2b', 'approval', addDays(today, -14), 'EMP-1001', 'Ananya Sharma', { level: 'Manager' }),
      step('S2c', 'approval', addDays(today, -13), 'EMP-HR-001', HR_DEMO_USER_NAME, { level: 'HR' }),
    ],
  })

  push({
    id: 'LR-003',
    employeeId: 'EMP-1010',
    leaveTypeCode: 'SL',
    fromDate: addDays(today, 2),
    toDate: addDays(today, 4),
    days: 3,
    segments: [],
    reason: 'Fever',
    attachmentName: 'medical.pdf',
    appliedOn: addDays(today, -4),
    status: 'Pending',
    currentLevel: 'HR',
    currentStepLabel: 'Pending: HR',
    escalated: true,
    steps: [
      step('S3a', 'applied', addDays(today, -4), 'EMP-1010', 'Nikhil Verma'),
      step('S3b', 'approval', addDays(today, -3), 'EMP-HR-001', HR_DEMO_USER_NAME, { level: 'Manager' }),
      step('S3c', 'escalation', addDays(today, -1), 'EMP-HR-001', HR_DEMO_USER_NAME),
    ],
  })

  push({
    id: 'LR-004',
    employeeId: 'EMP-1005',
    leaveTypeCode: 'CL',
    fromDate: addDays(today, 8),
    toDate: addDays(today, 8),
    days: 1,
    segments: [],
    reason: 'Errand',
    appliedOn: addDays(today, -2),
    status: 'Cancelled',
    currentLevel: null,
    currentStepLabel: 'Cancelled',
    escalated: false,
    steps: [
      step('S4a', 'applied', addDays(today, -2), 'EMP-1005', 'Sneha Reddy'),
      step('S4b', 'cancellation', addDays(today, -1), 'EMP-1005', 'Sneha Reddy', { comment: 'Plan changed' }),
    ],
  })

  for (const row of buildMockRequestBatch(today)) {
    push(row)
  }

  push({
    id: 'LR-029',
    employeeId: 'EMP-1001',
    leaveTypeCode: 'EL',
    fromDate: addDays(today, 12),
    toDate: addDays(today, 14),
    days: 3,
    lwpDays: 1,
    convertedToLwp: true,
    segments: [],
    reason: 'Vacation with LWP conversion',
    appliedOn: today,
    status: 'Pending',
    currentLevel: 'HR',
    currentStepLabel: 'Pending: HR',
    escalated: false,
    steps: [step('S29', 'applied', today, 'EMP-1001', 'Ananya Sharma')],
  })

  push({
    id: 'LR-030',
    employeeId: 'EMP-1006',
    leaveTypeCode: 'LWP',
    fromDate: addDays(today, -30),
    toDate: addDays(today, -28),
    days: 3,
    segments: [],
    reason: 'Unpaid personal',
    appliedOn: addDays(today, -35),
    status: 'Approved',
    currentLevel: null,
    currentStepLabel: 'Approved',
    escalated: false,
    steps: [step('S30', 'applied', addDays(today, -35), 'EMP-1006', 'Arjun Das')],
  })

  return items
}
