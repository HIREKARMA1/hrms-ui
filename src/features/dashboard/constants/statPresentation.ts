import type { DashboardStat } from '../types/dashboard'

export type DashboardStatCardId = 'total' | 'active' | 'leave' | 'inactive'

type StatPresentation = Omit<DashboardStat, 'id' | 'value'>

export const DASHBOARD_STAT_CARD_ORDER: DashboardStatCardId[] = [
  'total',
  'active',
  'leave',
  'inactive',
]

/** Presentation only — no fabricated trend percentages. */
export const STAT_PRESENTATION_BY_ID: Record<DashboardStatCardId, StatPresentation> = {
  total: {
    label: 'Total Employees',
    icon: 'users',
    trend: { value: 'From organization summary', positive: true },
    iconClassName: 'bg-[#CCFBF1] text-[#0F766E]',
  },
  active: {
    label: 'Active Employees',
    icon: 'userCheck',
    trend: { value: 'From organization summary', positive: true },
    iconClassName: 'bg-[#CCFBF1] text-[#0F766E]',
  },
  leave: {
    label: 'On Leave',
    icon: 'calendarDays',
    trend: { value: 'From organization summary', positive: true },
    iconClassName: 'bg-[#CCFBF1] text-[#0F766E]',
  },
  inactive: {
    label: 'Inactive Employees',
    icon: 'userX',
    trend: { value: 'From organization summary', positive: false },
    iconClassName: 'bg-[#EEF0F6] text-[#667085]',
  },
}
