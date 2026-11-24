/**
 * Human labels for API weekly-off rules (weekday + optional occurrence).
 */
import type { WeeklyOffRule, WeeklyOffWeekday } from '@/features/officeCalendar/types/api/weeklyOffs.types'

const WEEKDAY_TITLES: Record<WeeklyOffWeekday, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

const ORDINALS = ['', '1st', '2nd', '3rd', '4th', '5th'] as const

export function weeklyOffWeekdayTitle(weekday: WeeklyOffWeekday): string {
  return WEEKDAY_TITLES[weekday]
}

export function formatWeeklyOffRule(rule: WeeklyOffRule): string {
  const day = weeklyOffWeekdayTitle(rule.weekday)
  if (rule.occurrence !== undefined && rule.occurrence !== null) {
    const ord = ORDINALS[rule.occurrence] ?? `${rule.occurrence}th`
    return `${ord} ${day} of each month`
  }
  return `Every ${day}`
}

export function weeklyOffRuleKey(rule: WeeklyOffRule): string {
  const occ = rule.occurrence ?? 'all'
  return `${rule.weekday}-${occ}`
}