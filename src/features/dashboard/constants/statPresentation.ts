/**
 * Live summary card copy for GET /dashboard/summary (no mock trend percentages).
 */

import type { DashboardStat } from '../types/dashboard'

export type DashboardStatCardId = 'total' | 'active' | 'leave' | 'probation' | 'terminated'

type StatPresentation = Omit<DashboardStat, 'id' | 'value'>

export const LIVE_SUMMARY_FOOTLINE = 'As of today · live from HRMS'

export const LIVE_TOTAL_EMPLOYEES_FOOTLINE = 'All employee records · live from HRMS'

export const LIVE_ACTIVE_EMPLOYEES_FOOTLINE = 'Employment status ACTIVE · live from HRMS'

export const LIVE_TERMINATED_EMPLOYEES_FOOTLINE = 'Employment status TERMINATED · live from HRMS'

export const DASHBOARD_STAT_CARD_ORDER: DashboardStatCardId[] = [
  'total',
  'active',
  'leave',
  'probation',
  'terminated',
]

export const STAT_PRESENTATION_BY_ID: Record<DashboardStatCardId, StatPresentation> = {
  total: {
    label: 'Total employees',
    icon: 'users',
    footline: LIVE_TOTAL_EMPLOYEES_FOOTLINE,
    iconClassName: 'bg-brand-50 text-brand-600',
  },
  active: {
    label: 'Active',
    icon: 'userCheck',
    footline: LIVE_ACTIVE_EMPLOYEES_FOOTLINE,
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  leave: {
    label: 'On leave',
    icon: 'calendarDays',
    footline: LIVE_SUMMARY_FOOTLINE,
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  probation: {
    label: 'On probation',
    icon: 'hourglass',
    footline: LIVE_SUMMARY_FOOTLINE,
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  terminated: {
    label: 'Terminated',
    icon: 'userX',
    footline: LIVE_TERMINATED_EMPLOYEES_FOOTLINE,
    iconClassName: 'bg-rose-50 text-rose-600',
  },
}