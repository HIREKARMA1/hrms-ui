/**
 * Pure validation for apply-leave with blocking errors and optional warnings.
 * Used by ApplyLeaveDialog before calling leaveService.submitRequest.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LeaveSettings } from '../types/leaveSettings'
import { countLeaveDays } from './countLeaveDays'
import { ledgerBalanceForType } from './calculateBalance'
import type { LedgerEntry } from '../types/ledger'
import { calculateTeamCoverage } from './calculateTeamCoverage'
import { leaveTodayIso } from './leaveToday'
import { addDays } from './leaveDates'

export type LeaveValidationInput = {
  employeeId: string
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  portion?: 'full' | 'first_half' | 'second_half'
  firstDayHalf?: boolean
  lastDayHalf?: boolean
  convertExtraToLwp?: boolean
  attachmentName?: string
  maternityChildNumber?: number
}

export type LeaveValidationResult = {
  errors: string[]
  warnings: string[]
  daysCounted: number
  extraLwpDays: number
  coverageWarnings: string[]
}

/**
 * Server balance mode. `availableByType` holds the server's available paid
 * days per type code (pending requests already reserved); null means the
 * balance is not known yet, so the balance check is skipped. Days beyond the
 * balance are not an error: the server records them as loss of pay.
 */
export type ServerBalanceOptions = {
  availableByType: Record<string, number> | null
}

function overlaps(existing: LeaveRequest, from: string, to: string): boolean {
  return existing.fromDate <= to && existing.toDate >= from
}

export function validateLeaveRequest(
  input: LeaveValidationInput,
  settings: LeaveSettings,
  employee: LeaveEmployee,
  ledger: LedgerEntry[],
  existing: LeaveRequest[],
  allEmployees: LeaveEmployee[],
  serverBalance?: ServerBalanceOptions,
): LeaveValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const policy = settings.leaveTypes.find((item) => item.code === input.leaveTypeCode)
  if (!policy || !policy.enabled) {
    return { errors: ['Leave type is not available.'], warnings: [], daysCounted: 0, extraLwpDays: 0, coverageWarnings: [] }
  }
  if (input.toDate < input.fromDate) {
    errors.push('End date cannot be before start date.')
  }
  if (input.portion && input.portion !== 'full' && input.fromDate !== input.toDate) {
    errors.push('Half-day leave must start and end on the same date.')
  }
  const days = countLeaveDays(settings, policy, input)
  if (employee.joiningDate && settings.minProbationMonths > 0) {
    const probationEnd = addDays(employee.joiningDate, settings.minProbationMonths * 30)
    if (leaveTodayIso() < probationEnd && policy.code !== 'LWP') {
      errors.push('Employee is still in probation for this leave type.')
    }
  }
  if (policy.eligibleGender !== 'All' && policy.eligibleGender !== employee.gender) {
    errors.push('Leave type is not eligible for this employee.')
  }
  if (policy.maxConsecutiveDays !== null && days > policy.maxConsecutiveDays) {
    errors.push(`Maximum consecutive days is ${policy.maxConsecutiveDays}.`)
  }
  const noticeOk = addDays(leaveTodayIso(), policy.minNoticeDays)
  if (input.fromDate < noticeOk) {
    errors.push(`Minimum notice is ${policy.minNoticeDays} day(s).`)
  }
  const earliest = addDays(leaveTodayIso(), -policy.backdatingAllowedDays)
  if (input.fromDate < earliest) {
    errors.push(`Cannot backdate more than ${policy.backdatingAllowedDays} days.`)
  }
  if (!input.reason.trim()) {
    errors.push('Reason is required.')
  }
  if (
    policy.medicalCertificateAfterDays !== null &&
    days >= policy.medicalCertificateAfterDays &&
    !input.attachmentName
  ) {
    errors.push('Medical certificate is required for this duration.')
  }
  const active = existing.filter(
    (item) =>
      item.employeeId === input.employeeId &&
      (item.status === 'Pending' || item.status === 'Approved') &&
      overlaps(item, input.fromDate, input.toDate),
  )
  if (active.length > 0) {
    errors.push('Dates overlap another pending or approved request.')
  }
  let extraLwp = 0
  if (serverBalance) {
    const available = serverBalance.availableByType ? (serverBalance.availableByType[policy.code] ?? 0) : null
    if (policy.paid && available !== null && days > available) {
      extraLwp = Math.round((days - Math.max(available, 0)) * 100) / 100
      warnings.push(`${extraLwp} day(s) exceed the available balance and will be recorded as loss of pay.`)
    }
  } else if (policy.paid && policy.code !== 'LWP') {
    const balance = ledgerBalanceForType(ledger, input.employeeId, policy.code)
    const pending = existing
      .filter((item) => item.employeeId === input.employeeId && item.status === 'Pending')
      .reduce((sum, item) => sum + (item.leaveTypeCode === policy.code ? item.days : 0), 0)
    const available = balance - pending
    if (days > available) {
      if (policy.allowLwpConversion) {
        extraLwp = days - available
        warnings.push(`Convert the extra ${extraLwp} day(s) to Leave Without Pay.`)
      } else {
        errors.push('Insufficient leave balance.')
      }
    }
  }
  if (input.convertExtraToLwp && extraLwp <= 0) {
    warnings.push('No extra days need LWP conversion.')
  }
  const coverage = calculateTeamCoverage(
    settings.teamCoverage,
    employee.department,
    input.employeeId,
    input.fromDate,
    input.toDate,
    allEmployees,
    existing,
  )
  const coverageWarnings = coverage.map(
    (item) => `Team coverage: ${item.count} in ${item.department} on ${item.date}.`,
  )
  if (settings.teamCoverage.mode === 'block' && coverage.length > 0) {
    errors.push('Too many colleagues are already on leave on one or more selected days.')
  } else {
    warnings.push(...coverageWarnings)
  }
  const lwpDays = serverBalance ? extraLwp : input.convertExtraToLwp ? extraLwp : 0
  return { errors, warnings, daysCounted: days, extraLwpDays: lwpDays, coverageWarnings }
}
