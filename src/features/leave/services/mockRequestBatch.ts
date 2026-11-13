/**
 * Bulk-generated mock leave requests to reach ~30 rows in the seed data.
 */

import type { LeaveRequest } from '../types/leaveRequest'
import { HR_DEMO_USER_NAME } from '../constants/leaveRules'
import { addDays } from '../utils/leaveDates'

const EMPLOYEE_NAMES: Record<string, string> = {
  'EMP-1001': 'Ananya Sharma',
  'EMP-1002': 'Rahul Mehta',
  'EMP-1003': 'Priya Nair',
  'EMP-1004': 'Vikram Singh',
  'EMP-1005': 'Sneha Reddy',
  'EMP-1006': 'Arjun Das',
  'EMP-1007': 'Meera Iyer',
  'EMP-1008': 'Karan Patel',
  'EMP-1009': 'Divya Rao',
  'EMP-1010': 'Nikhil Verma',
  'EMP-1011': 'Pooja Kulkarni',
  'EMP-1012': 'Aditya Ghosh',
}

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

export function buildMockRequestBatch(today: string): LeaveRequest[] {
  const employeeIds = Object.keys(EMPLOYEE_NAMES)
  const items: LeaveRequest[] = []
  for (let index = 5; index <= 28; index++) {
    const employeeId = employeeIds[index % employeeIds.length]
    const applicant = EMPLOYEE_NAMES[employeeId]
    const status = index % 5 === 0 ? 'Rejected' : index % 4 === 0 ? 'Approved' : 'Pending'
    const code = index % 3 === 0 ? 'EL' : index % 2 === 0 ? 'SL' : 'CL'
    const from = addDays(today, index % 7)
    const to = addDays(from, (index % 3) + 1)
    const appliedOn = status === 'Pending' ? addDays(today, -(index % 9)) : addDays(from, -2)
    const steps = [step(`Sx${index}a`, 'applied', appliedOn, employeeId, applicant)]
    if (status === 'Approved') {
      steps.push(step(`Sx${index}b`, 'approval', addDays(appliedOn, 1), 'EMP-HR-001', HR_DEMO_USER_NAME, { level: 'HR' }))
    }
    if (status === 'Rejected') {
      steps.push(step(`Sx${index}b`, 'rejection', addDays(appliedOn, 1), 'EMP-HR-001', HR_DEMO_USER_NAME))
    }
    items.push({
      id: `LR-${String(index).padStart(3, '0')}`,
      employeeId,
      leaveTypeCode: code,
      fromDate: from,
      toDate: to,
      days: 2,
      segments: [],
      reason: `Mock request ${index}`,
      appliedOn,
      status,
      currentLevel: status === 'Pending' ? 'Manager' : null,
      currentStepLabel: status === 'Pending' ? 'Pending: Manager' : status,
      escalated: false,
      convertedToLwp: index === 12,
      lwpDays: index === 12 ? 1 : undefined,
      steps,
    })
  }
  return items
}
