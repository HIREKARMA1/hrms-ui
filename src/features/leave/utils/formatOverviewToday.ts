/**
 * Today's label for the HR Overview title row.
 */

import { leaveToday } from './leaveToday'

export function formatOverviewTodayLabel(): string {
  return leaveToday().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
