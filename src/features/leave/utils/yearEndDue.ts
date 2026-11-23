/**
 * True when within the last 30 calendar days of the configured leave year.
 */

import type { LeaveSettings } from '../types/leaveSettings'
import { leaveToday } from './leaveToday'

export function isYearEndDue(settings: LeaveSettings): boolean {
  const today = leaveToday()
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()

  if (settings.leaveYearMode === 'jan_dec') {
    const end = new Date(year, 11, 31)
    const startWindow = new Date(end)
    startWindow.setDate(end.getDate() - 29)
    return today >= startWindow && today <= end
  }
  const end = month < 3 || (month === 3 && day <= 31) ? new Date(year, 2, 31) : new Date(year + 1, 2, 31)
  const startWindow = new Date(end)
  startWindow.setDate(end.getDate() - 29)
  return today >= startWindow && today <= end
}
