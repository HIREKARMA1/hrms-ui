/**
 * Extra approved leave spanning past months for Overview charts and coverage demos.
 */

import type { LeaveRequest } from '../types/leaveRequest'
import { HR_DEMO_USER_NAME } from '../constants/leaveRules'
import { addDays } from '../utils/leaveDates'

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

function approved(
  id: string,
  employeeId: string,
  name: string,
  code: string,
  from: string,
  to: string,
  days: number,
  reason: string,
  appliedOn: string,
) {
  return {
    id,
    employeeId,
    leaveTypeCode: code,
    fromDate: from,
    toDate: to,
    days,
    segments: [],
    reason,
    appliedOn,
    status: 'Approved' as const,
    currentLevel: null,
    currentStepLabel: 'Approved',
    escalated: false,
    steps: [step(`${id}a`, 'applied', appliedOn, employeeId, name), step(`${id}b`, 'approval', addDays(appliedOn, 1), 'EMP-HR-001', HR_DEMO_USER_NAME, { level: 'HR' })],
  }
}

export function buildOverviewHistoryRequests(today: string): LeaveRequest[] {
  return [
    approved('LR-H01', 'EMP-1006', 'Arjun Das', 'CL', today, today, 1, 'Errand', addDays(today, -3)),
    approved('LR-H02', 'EMP-1011', 'Pooja Kulkarni', 'SL', today, addDays(today, 1), 2, 'Flu', addDays(today, -5)),
    approved('LR-H03', 'EMP-1001', 'Ananya Sharma', 'EL', addDays(today, -120), addDays(today, -118), 3, 'Break', addDays(today, -130)),
    approved('LR-H04', 'EMP-1007', 'Meera Iyer', 'PL', addDays(today, -90), addDays(today, -88), 3, 'Family', addDays(today, -95)),
    approved('LR-H05', 'EMP-1008', 'Karan Patel', 'SL', addDays(today, -60), addDays(today, -58), 3, 'Recovery', addDays(today, -65)),
    approved('LR-H06', 'EMP-1010', 'Nikhil Verma', 'CL', addDays(today, -45), addDays(today, -44), 2, 'Travel', addDays(today, -50)),
    approved('LR-H07', 'EMP-1002', 'Rahul Mehta', 'EL', addDays(today, -35), addDays(today, -33), 3, 'Personal', addDays(today, -40)),
    approved('LR-H08', 'EMP-1005', 'Sneha Reddy', 'CO', addDays(today, -20), addDays(today, -20), 1, 'Comp-off', addDays(today, -22)),
  ]
}
