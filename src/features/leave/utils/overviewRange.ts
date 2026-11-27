/**
 * Chart date ranges for HR Overview.
 */

import { isoFromDate, parseIso } from './leaveDates'
import { leaveTodayIso } from './leaveToday'

export type OverviewChartRange = 'last_3_months' | 'last_6_months' | 'this_year'

export function overviewRangeLabel(range: OverviewChartRange): string {
  if (range === 'last_3_months') return 'Last 3 months'
  if (range === 'last_6_months') return 'Last 6 months'
  return 'This year'
}

export function overviewRangeHint(range: OverviewChartRange): string {
  return overviewRangeLabel(range)
}

export function overviewRangeBounds(range: OverviewChartRange, today = leaveTodayIso()): { from: string; to: string } {
  const anchor = parseIso(today)
  if (range === 'last_3_months') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1)
    return { from: isoFromDate(start), to: today }
  }
  if (range === 'last_6_months') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - 5, 1)
    return { from: isoFromDate(start), to: today }
  }
  const year = today.slice(0, 4)
  // Dashboard leave analytics rejects future end dates — year-to-date only.
  return { from: `${year}-01-01`, to: today }
}

export function monthKeysBetween(from: string, to: string): string[] {
  const keys: string[] = []
  let cursor = from.slice(0, 7)
  const endKey = to.slice(0, 7)
  while (cursor <= endKey) {
    keys.push(cursor)
    const next = parseIso(`${cursor}-01`)
    next.setMonth(next.getMonth() + 1)
    cursor = isoFromDate(next).slice(0, 7)
  }
  return keys
}
