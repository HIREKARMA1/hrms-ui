/**
 * Full-sentence policy preview for employees (Leave type edit dialog, right column).
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import { resolveEarningModel } from './leaveEarningModel'

function daysWord(n: number) {
  return `${n} day${n === 1 ? '' : 's'}`
}

function approvalSentence(policy: LeaveTypePolicy): string {
  if (policy.approvalChain === 'manager') return 'Manager approval is required.'
  if (policy.approvalChain === 'hr') return 'HR approval is required.'
  const n = policy.managerOnlyUpToDays
  if (n != null && n > 0) {
    return `Requests up to ${daysWord(n)} need Manager approval only. Longer requests also need HR approval.`
  }
  return 'Manager and HR approval are required.'
}

export function buildEmployeeLeavePreview(policy: LeaveTypePolicy): string[] {
  const model = resolveEarningModel(policy)
  const lines: string[] = []
  const quota = policy.annualQuotaDays

  if (model === 'unpaid') {
    lines.push(`${policy.label} is unpaid leave with no balance limit.`)
  } else if (model === 'comp_off') {
    lines.push(`Compensatory off is earned by working on a holiday and expires after ${daysWord(policy.compOffExpiryDays ?? 60)}.`)
  } else if (model === 'per_event') {
    if (policy.code === 'MAT' && policy.perEventDaysFromThirdChild != null && quota != null) {
      lines.push(`Maternity leave is up to ${daysWord(quota)} per event for the first two children, and ${daysWord(policy.perEventDaysFromThirdChild)} from the third child onwards.`)
    } else {
      lines.push(`${policy.label} is up to ${daysWord(quota ?? 0)} per event.`)
    }
  } else if (model === 'per_days_worked') {
    const n = policy.daysWorkedPerAccrualDay ?? 20
    lines.push(`You earn 1 day for every ${n} days worked after ${daysWord(policy.qualifyingDays ?? 0)} of service.`)
  } else if (model === 'earned_monthly') {
    lines.push(`You get ${daysWord(quota ?? 0)} a year, credited a little each month.`)
  } else {
    lines.push(`You get ${daysWord(quota ?? 0)} paid days at the start of each leave year.`)
  }

  if (policy.eligibleGender !== 'All') {
    lines.push(`Only ${policy.eligibleGender.toLowerCase()} employees can use this leave.`)
  }
  if (policy.minServiceMonths > 0) {
    lines.push(`You need ${daysWord(policy.minServiceMonths)} of service before using this leave.`)
  }
  if (policy.maxConsecutiveDays != null && policy.maxConsecutiveDays > 0) {
    lines.push(`The longest single leave is ${daysWord(policy.maxConsecutiveDays)}.`)
  }
  if (policy.minNoticeDays > 0) {
    lines.push(`Apply at least ${daysWord(policy.minNoticeDays)} before the leave starts.`)
  }
  if (policy.backdatingAllowedDays > 0) {
    lines.push(`You can apply for past dates up to ${daysWord(policy.backdatingAllowedDays)} back.`)
  } else {
    lines.push('Past dates are not allowed.')
  }
  if (policy.medicalCertificateAfterDays != null && policy.medicalCertificateAfterDays > 0) {
    lines.push(`A medical certificate is required after ${daysWord(policy.medicalCertificateAfterDays)} of sick leave.`)
  }
  lines.push(policy.halfDayAllowed ? 'Half days are allowed.' : 'Half days are not allowed.')
  lines.push(policy.dayCounting === 'working' ? 'Leave days count as working days only.' : 'Leave days count as calendar days.')
  if (accruesUnusedLine(model)) {
    if (policy.carryForward === 'capped') {
      lines.push(`Unused days at year end can carry forward up to ${daysWord(policy.carryForwardCapDays ?? 0)}.`)
    } else {
      lines.push('Unused days at year end expire.')
    }
    if (policy.encashable) lines.push('Remaining balance can be paid out in cash where rules allow.')
    if (policy.allowLwpConversion) lines.push('If the balance runs out, extra days can be taken as unpaid leave.')
  }
  lines.push(approvalSentence(policy))
  if (!policy.enabled) lines.push('This leave type is currently inactive.')
  return lines
}

function accruesUnusedLine(model: ReturnType<typeof resolveEarningModel>) {
  return model === 'yearly_quota' || model === 'earned_monthly' || model === 'per_days_worked'
}
