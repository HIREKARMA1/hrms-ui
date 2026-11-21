import type { DashboardStat } from '../types/dashboard'

export type DashboardStatCardId = 'total' | 'active' | 'leave' | 'inactive'

type StatPresentation = Omit<DashboardStat, 'id' | 'value'>

export const DASHBOARD_STAT_CARD_ORDER: DashboardStatCardId[] = [
  'total',
  'active',
  'leave',
  'inactive',
]

export const STAT_PRESENTATION_BY_ID: Record<DashboardStatCardId, StatPresentation> = {
  total: {
    label: 'Total Employees',
    icon: 'users',
    trend: { value: '+6.4% from last month', positive: true },
    iconClassName: 'bg-brand-50 text-brand-600',
  },
  active: {
    label: 'Active Employees',
    icon: 'userCheck',
    trend: { value: '+5.8% from last month', positive: true },
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  leave: {
    label: 'On Leave',
    icon: 'calendarDays',
    trend: { value: '+20% from last month', positive: true },
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  inactive: {
    label: 'Inactive Employees',
    icon: 'userX',
    trend: { value: '-3.2% from last month', positive: false },
    iconClassName: 'bg-rose-50 text-rose-600',
  },
}