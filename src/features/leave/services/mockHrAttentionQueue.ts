/**

 * Eight HR-queue leave requests for Overview attention demos (2 overdue, coverage risk).

 */



import type { LeaveRequest } from '../types/leaveRequest'

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



type Seed = {

  id: string

  employeeId: string

  name: string

  code: string

  from: string

  to: string

  days: number

  appliedOn: string

  escalated?: boolean

}



export function buildHrAttentionQueue(today: string): LeaveRequest[] {

  const seeds: Seed[] = [

    { id: 'LR-W01', employeeId: 'EMP-1002', name: 'Rahul Mehta', code: 'EL', from: addDays(today, 3), to: addDays(today, 5), days: 3, appliedOn: addDays(today, -6), escalated: true },

    { id: 'LR-W02', employeeId: 'EMP-1007', name: 'Meera Iyer', code: 'CL', from: addDays(today, 1), to: addDays(today, 2), days: 2, appliedOn: addDays(today, -5) },

    { id: 'LR-W03', employeeId: 'EMP-1004', name: 'Vikram Singh', code: 'SL', from: addDays(today, 7), to: addDays(today, 8), days: 2, appliedOn: addDays(today, -4) },

    { id: 'LR-W04', employeeId: 'EMP-1009', name: 'Divya Rao', code: 'EL', from: addDays(today, 10), to: addDays(today, 12), days: 3, appliedOn: addDays(today, -3) },

    { id: 'LR-W05', employeeId: 'EMP-1010', name: 'Nikhil Verma', code: 'CL', from: today, to: today, days: 1, appliedOn: addDays(today, -7), escalated: true },

    { id: 'LR-W06', employeeId: 'EMP-1003', name: 'Priya Nair', code: 'PL', from: addDays(today, 4), to: addDays(today, 5), days: 2, appliedOn: addDays(today, -2) },

    { id: 'LR-W07', employeeId: 'EMP-1005', name: 'Sneha Reddy', code: 'SL', from: addDays(today, 6), to: addDays(today, 7), days: 2, appliedOn: addDays(today, -1) },

    { id: 'LR-W08', employeeId: 'EMP-1006', name: 'Arjun Das', code: 'CL', from: addDays(today, 2), to: addDays(today, 3), days: 2, appliedOn: today },

  ]

  return seeds.map((seed) => ({

    id: seed.id,

    employeeId: seed.employeeId,

    leaveTypeCode: seed.code,

    fromDate: seed.from,

    toDate: seed.to,

    days: seed.days,

    segments: [],

    reason: 'Coverage demo queue',

    appliedOn: seed.appliedOn,

    status: 'Pending' as const,

    currentLevel: 'HR' as const,

    currentStepLabel: 'Pending: HR',

    escalated: Boolean(seed.escalated),

    steps: [

      step(`${seed.id}a`, 'applied', seed.appliedOn, seed.employeeId, seed.name),

      ...(seed.escalated ? [step(`${seed.id}b`, 'escalation', today, 'EMP-HR-001', 'System')] : []),

      step(`${seed.id}c`, 'approval', addDays(seed.appliedOn, 1), 'EMP-1001', 'Ananya Sharma', { level: 'Manager' }),

    ],

  }))

}


