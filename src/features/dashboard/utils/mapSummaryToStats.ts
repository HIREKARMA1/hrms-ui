import {
  DASHBOARD_STAT_CARD_ORDER,
  STAT_PRESENTATION_BY_ID,
  type DashboardStatCardId,
} from '../constants/statPresentation'
import type { DashboardStat } from '../types/dashboard'
import type { DashboardSummaryData } from '../types/dashboardSummary.types'

const SUMMARY_FIELD_BY_CARD_ID: Record<
  DashboardStatCardId,
  keyof DashboardSummaryData
> = {
  total: 'totalEmployees',
  active: 'activeEmployees',
  leave: 'onLeaveEmployees',
  inactive: 'inactiveEmployees',
}

export function mapSummaryToStats(summary: DashboardSummaryData): DashboardStat[] {
  return DASHBOARD_STAT_CARD_ORDER.map((id) => {
    const field = SUMMARY_FIELD_BY_CARD_ID[id]
    return {
      id,
      ...STAT_PRESENTATION_BY_ID[id],
      value: String(summary[field]),
    }
  })
}

export function dashboardStatPlaceholders(): DashboardStat[] {
  return DASHBOARD_STAT_CARD_ORDER.map((id) => ({
    id,
    ...STAT_PRESENTATION_BY_ID[id],
    value: '—',
  }))
}