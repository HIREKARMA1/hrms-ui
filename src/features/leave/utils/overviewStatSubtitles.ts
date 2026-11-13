/**
 * Secondary lines under the four Overview stat cards.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'
import {
  countActiveEmployees,
  countOnLeaveToday,
  countPendingRequests,
  countPendingWaitingOnHr,
  countUpcomingLeave7Days,
} from './leaveHrMetrics'

export type OverviewStatSubtitles = {
  onLeaveToday: string
  upcoming: string
  pending: string
  active: string
}

export function overviewStatSubtitles(snapshot: LeaveSnapshot): OverviewStatSubtitles {
  const active = countActiveEmployees(snapshot)
  const hrQueue = countPendingWaitingOnHr(snapshot)
  const probation = activeEmployees(snapshot.employees).filter((item) => item.employmentStatus === 'PROBATION').length
  return {
    onLeaveToday: `of ${active} active`,
    upcoming: 'starting in the next 7 days',
    pending: hrQueue === 0 ? 'none waiting on HR' : `${hrQueue} waiting on HR`,
    active: `${probation} on probation`,
  }
}

export function overviewStatValues(snapshot: LeaveSnapshot) {
  return {
    onLeaveToday: countOnLeaveToday(snapshot),
    upcoming: countUpcomingLeave7Days(snapshot),
    pending: countPendingRequests(snapshot),
    active: countActiveEmployees(snapshot),
  }
}
