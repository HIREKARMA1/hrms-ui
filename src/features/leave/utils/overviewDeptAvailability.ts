/**

 * Department headcount vs on-leave today for Overview availability bars.

 */



import type { LeaveSnapshot } from '../services/leaveService'

import { activeEmployees, isOnApprovedLeaveToday } from './employmentStatus'

import { leaveTodayIso } from './leaveToday'



export type DeptAvailabilityRow = {

  department: string

  headcount: number

  onLeave: number

  percent: number

  severity: 'ok' | 'warn' | 'danger'

}



export function departmentAvailabilityToday(snapshot: LeaveSnapshot): DeptAvailabilityRow[] {

  const today = leaveTodayIso()

  const limit = snapshot.settings.teamCoverage.maxSameDepartmentPerDay

  const grouped = new Map<string, { head: number; away: number }>()

  for (const emp of activeEmployees(snapshot.employees)) {

    const slot = grouped.get(emp.department) ?? { head: 0, away: 0 }

    slot.head += 1

    if (isOnApprovedLeaveToday(emp.id, snapshot.requests, today)) slot.away += 1

    grouped.set(emp.department, slot)

  }

  return [...grouped.entries()]

    .filter(([, slot]) => slot.head > 0)

    .map(([department, { head, away }]) => ({

      department,

      headcount: head,

      onLeave: away,

      percent: head > 0 ? Math.round((away / head) * 100) : 0,

      severity: (away > limit ? 'danger' : away >= limit ? 'warn' : 'ok') as DeptAvailabilityRow['severity'],

    }))

    .sort((a, b) => b.onLeave - a.onLeave || a.department.localeCompare(b.department))

}


