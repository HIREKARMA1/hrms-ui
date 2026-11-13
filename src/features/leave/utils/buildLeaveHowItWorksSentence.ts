/**
 * One plain sentence for the Leave types settings table ("How it works" column).
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import { resolveEarningModel } from './leaveEarningModel'

function daysWord(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`
}

export function buildLeaveHowItWorksSentence(policy: LeaveTypePolicy): string {
  const model = resolveEarningModel(policy)
  const quota = policy.annualQuotaDays
  if (model === 'unpaid') return 'No limit, no balance'
  if (model === 'comp_off') {
    const expiry = policy.compOffExpiryDays ?? 60
    return `Earned by working on a holiday, expires after ${daysWord(expiry)}`
  }
  if (model === 'per_event') {
    const main = quota ?? 0
    if (policy.code === 'MAT' && policy.perEventDaysFromThirdChild != null) {
      return `Up to ${daysWord(main)} per event (first two children), ${daysWord(policy.perEventDaysFromThirdChild)} from the third child`
    }
    return `Up to ${daysWord(main)} per event`
  }
  if (model === 'per_days_worked') {
    const n = policy.daysWorkedPerAccrualDay ?? 20
    const est = Math.round((240 / n) * 10) / 10
    return `Earned 1 day for every ${n} days worked, about ${est} a year`
  }
  if (model === 'earned_monthly') {
    return quota != null ? `${daysWord(quota)} a year, credited a little each month` : 'Credited each month'
  }
  return quota != null ? `${daysWord(quota)} a year, credited at the start of the year` : 'Credited at the start of the year'
}
