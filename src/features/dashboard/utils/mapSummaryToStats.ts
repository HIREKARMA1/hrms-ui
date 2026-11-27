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
  probation: 'probationEmployees',
  terminated: 'inactiveEmployees',
}

export type MapSummaryToStatsOptions = {
  /** From GET /dashboard/employees/total — overrides summary total for the Total card. */
  totalEmployees?: number
  /** From GET /dashboard/employees/active — overrides summary active for the Active card. */
  activeEmployees?: number
  /** From GET /dashboard/employees/inactive — overrides summary for the Terminated card. */
  inactiveEmployees?: number
}

export function mapSummaryToStats(
  summary: DashboardSummaryData,
  options?: MapSummaryToStatsOptions,
): DashboardStat[] {
  return DASHBOARD_STAT_CARD_ORDER.map((id) => {
    const presentation = STAT_PRESENTATION_BY_ID[id]
    if (id === 'total') {
      const total =
        options?.totalEmployees !== undefined
          ? options.totalEmployees
          : summary.totalEmployees
      return {
        id,
        ...presentation,
        value: String(total),
      }
    }
    if (id === 'active') {
      const active =
        options?.activeEmployees !== undefined
          ? options.activeEmployees
          : summary.activeEmployees
      return {
        id,
        ...presentation,
        value: String(active),
      }
    }
    if (id === 'terminated') {
      const terminated =
        options?.inactiveEmployees !== undefined
          ? options.inactiveEmployees
          : summary.inactiveEmployees
      return {
        id,
        ...presentation,
        value: String(terminated),
      }
    }
    const field = SUMMARY_FIELD_BY_CARD_ID[id]
    return {
      id,
      ...presentation,
      value: String(summary[field]),
    }
  })
}

/** Patch a single stat card when its dedicated count API failed but summary loaded. */
export function withStatCardPlaceholder(
  stats: DashboardStat[],
  cardId: 'total' | 'active' | 'terminated',
): DashboardStat[] {
  return stats.map((stat) => (stat.id === cardId ? { ...stat, value: '—' } : stat))
}

/** @deprecated Use `withStatCardPlaceholder(stats, 'total')`. */
export function withTotalCardPlaceholder(stats: DashboardStat[]): DashboardStat[] {
  return withStatCardPlaceholder(stats, 'total')
}

export function dashboardStatPlaceholders(): DashboardStat[] {
  return DASHBOARD_STAT_CARD_ORDER.map((id) => ({
    id,
    ...STAT_PRESENTATION_BY_ID[id],
    value: '—',
  }))
}