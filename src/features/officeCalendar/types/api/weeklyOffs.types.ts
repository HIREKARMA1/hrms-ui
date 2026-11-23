/** Company weekly-off policy and generated dates (GET/POST /calendar/weekly-offs). */

export const WEEKLY_OFF_WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const

export type WeeklyOffWeekday = (typeof WEEKLY_OFF_WEEKDAYS)[number]

/** `occurrence` 1–5 = nth weekday in month; omit/null = every that weekday. */
export type WeeklyOffRule = {
  weekday: WeeklyOffWeekday
  occurrence?: number | null
}

export type WeeklyOffPolicy = {
  rules: WeeklyOffRule[]
  timezone?: string
  updatedAt?: string
}

export type ConfigureWeeklyOffRequest = {
  rules: WeeklyOffRule[]
  timezone?: string
}

export type WeeklyOffPolicyQuery = {
  timezone?: string
}

export type WeeklyOffDatesQuery = {
  year: number
  month?: number
  timezone?: string
}

export type WeeklyOffDatesData = {
  year: number
  month?: number
  dates: string[]
  timezone?: string
}

/** API allows at most 35 rules per POST /calendar/weekly-offs. */
export const MAX_WEEKLY_OFF_RULES = 35 as const