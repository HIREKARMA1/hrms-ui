/**
 * Counts leave days from policy rules, weekly offs, holidays, and sandwich rule.
 * Used when applying for leave and in request summaries.
 */

import type { HalfDayPortion } from '../types/leaveRequest'
import type { Holiday } from '../types/holiday'
import type { LeaveSettings, LeaveTypePolicy, SandwichRule } from '../types/leaveSettings'
import { daysBetweenInclusive } from './leaveDates'

type CountInput = {
  fromDate: string
  toDate: string
  firstDayHalf?: boolean
  lastDayHalf?: boolean
  portion?: HalfDayPortion
}

function isWeeklyOff(dateIso: string, weeklyOffDays: number[]): boolean {
  const day = new Date(`${dateIso}T12:00:00`).getDay()
  return weeklyOffDays.includes(day)
}

function isHoliday(dateIso: string, holidays: Holiday[]): boolean {
  return holidays.some((item) => item.date === dateIso)
}

function dayWeight(
  dateIso: string,
  from: string,
  to: string,
  input: CountInput,
): number {
  const singleDay = from === to
  if (singleDay && input.portion && input.portion !== 'full') {
    return 0.5
  }
  if (dateIso === from && input.firstDayHalf) {
    return 0.5
  }
  if (dateIso === to && input.lastDayHalf) {
    return 0.5
  }
  return 1
}

function countsDay(
  dateIso: string,
  policy: LeaveTypePolicy,
  settings: LeaveSettings,
): boolean {
  if (policy.dayCounting === 'calendar') {
    return true
  }
  if (isWeeklyOff(dateIso, settings.weeklyOffDays)) {
    return false
  }
  if (isHoliday(dateIso, settings.holidays)) {
    return false
  }
  return true
}

function applySandwich(
  dates: string[],
  sandwich: SandwichRule,
  settings: LeaveSettings,
): Set<string> {
  const set = new Set(dates)
  if (sandwich !== 'count' || dates.length < 2) {
    return set
  }
  const from = dates[0]
  const to = dates[dates.length - 1]
  for (const iso of daysBetweenInclusive(from, to)) {
    if (isWeeklyOff(iso, settings.weeklyOffDays) || isHoliday(iso, settings.holidays)) {
      set.add(iso)
    }
  }
  return set
}

export function countLeaveDays(
  settings: LeaveSettings,
  policy: LeaveTypePolicy,
  input: CountInput,
): number {
  const range = daysBetweenInclusive(input.fromDate, input.toDate)
  const sandwiched = applySandwich(range, settings.sandwichRule, settings)
  let total = 0
  for (const iso of sandwiched) {
    if (!countsDay(iso, policy, settings)) {
      continue
    }
    total += dayWeight(iso, input.fromDate, input.toDate, input)
  }
  return Math.round(total * 100) / 100
}
