/**
 * Seed leave type policies for companyDefaults (sample statutory-style rules).
 * Sample values, confirm with CA — edited via Leave Settings after load.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import type { LeaveEarningModel } from '../types/leaveEarningModel'

function base(
  code: string,
  label: string,
  earningModel: LeaveEarningModel,
  patch: Partial<LeaveTypePolicy>,
): LeaveTypePolicy {
  return {
    code,
    label,
    enabled: true,
    paid: true,
    earningModel,
    annualQuotaDays: 12,
    perEventDaysFromThirdChild: null,
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
    minServiceMonths: 0,
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
  base('CL', 'Casual Leave', 'yearly_quota', {
    annualQuotaDays: 12,
    accrualMethod: 'upfront',
    minNoticeDays: 2,
    maxConsecutiveDays: 3,
    managerOnlyUpToDays: 2,
    approvalChain: 'manager_hr',
  }),
  base('SL', 'Sick Leave', 'yearly_quota', {
    annualQuotaDays: 12,
    accrualMethod: 'upfront',
    medicalCertificateAfterDays: 3,
    managerOnlyUpToDays: 2,
    approvalChain: 'manager_hr',
  }),
  base('EL', 'Earned Leave', 'per_days_worked', {
    accrualMethod: 'per_days_worked',
    daysWorkedPerAccrualDay: 20,
    qualifyingDays: 180,
    carryForward: 'capped',
    carryForwardCapDays: 30,
    encashable: true,
    allowLwpConversion: true,
  }),
  base('PL', 'Paid Leave', 'yearly_quota', { annualQuotaDays: 6, accrualMethod: 'upfront' }),
  base('LWP', 'Leave Without Pay', 'unpaid', { paid: false, annualQuotaDays: null, accrualMethod: 'upfront', allowLwpConversion: false }),
  base('MAT', 'Maternity', 'per_event', {
    annualQuotaDays: 182,
    perEventDaysFromThirdChild: 84,
    dayCounting: 'calendar',
    eligibleGender: 'Female',
    halfDayAllowed: false,
    minNoticeDays: 30,
  }),
  base('PAT', 'Paternity', 'per_event', { annualQuotaDays: 15, eligibleGender: 'Male', minNoticeDays: 7, accrualMethod: 'upfront' }),
  base('CO', 'Compensatory Off', 'comp_off', { annualQuotaDays: null, accrualMethod: 'upfront', compOffExpiryDays: 60, encashable: false }),
  base('MAR', 'Marriage', 'per_event', { annualQuotaDays: 5, minNoticeDays: 14, accrualMethod: 'upfront' }),
  base('BER', 'Bereavement', 'per_event', { annualQuotaDays: 3, minNoticeDays: 0, backdatingAllowedDays: 3, accrualMethod: 'upfront' }),
]
