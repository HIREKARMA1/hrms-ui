/**
 * Seed leave type policies for companyDefaults (sample statutory-style rules).
 * Edited only via Leave Settings after first load; not imported by UI directly.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'

function base(
  code: string,
  label: string,
  patch: Partial<LeaveTypePolicy>,
): LeaveTypePolicy {
  return {
    code,
    label,
    enabled: true,
    paid: true,
    annualQuotaDays: 12,
    accrualMethod: 'monthly',
    daysWorkedPerAccrualDay: null,
    qualifyingDays: null,
    dayCounting: 'working',
    halfDayAllowed: true,
    maxConsecutiveDays: null,
    minNoticeDays: 0,
    backdatingAllowedDays: 7,
    medicalCertificateAfterDays: null,
    eligibleGender: 'All',
    carryForward: 'none',
    carryForwardCapDays: null,
    encashable: false,
    allowLwpConversion: false,
    compOffExpiryDays: null,
    approvalChain: 'manager_hr',
    managerOnlyUpToDays: null,
    ...patch,
  }
}

export const defaultLeaveTypes: LeaveTypePolicy[] = [
  base('CL', 'Casual Leave', { annualQuotaDays: 12, managerOnlyUpToDays: 2 }),
  base('SL', 'Sick Leave', {
    annualQuotaDays: 12,
    medicalCertificateAfterDays: 3,
    managerOnlyUpToDays: 2,
  }),
  base('EL', 'Earned Leave', {
    accrualMethod: 'per_days_worked',
    daysWorkedPerAccrualDay: 20,
    qualifyingDays: 180,
    carryForward: 'capped',
    carryForwardCapDays: 30,
    encashable: true,
    allowLwpConversion: true,
  }),
  base('PL', 'Paid Leave', { annualQuotaDays: 6 }),
  base('LWP', 'Leave Without Pay', {
    paid: false,
    annualQuotaDays: null,
    accrualMethod: 'upfront',
    allowLwpConversion: false,
  }),
  base('MAT', 'Maternity', {
    annualQuotaDays: 182,
    dayCounting: 'calendar',
    eligibleGender: 'Female',
    halfDayAllowed: false,
    minNoticeDays: 30,
  }),
  base('PAT', 'Paternity', {
    annualQuotaDays: 15,
    eligibleGender: 'Male',
    minNoticeDays: 7,
  }),
  base('CO', 'Compensatory Off', {
    annualQuotaDays: null,
    accrualMethod: 'upfront',
    compOffExpiryDays: 60,
    encashable: false,
  }),
  base('MAR', 'Marriage', { annualQuotaDays: 5, minNoticeDays: 14 }),
  base('BER', 'Bereavement', { annualQuotaDays: 3, minNoticeDays: 0, backdatingAllowedDays: 3 }),
]
