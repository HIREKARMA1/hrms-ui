import type { EncashmentPolicyForm } from '../../../utils/buildCreateEncashmentPolicyBody'

export const EMPTY_ENCASHMENT_POLICY_FORM: EncashmentPolicyForm = {
  leaveTypeId: '',
  ratePerDay: '',
  currency: 'INR',
  minDays: '0',
  maxDaysPerRequest: '',
  maxDaysPerYear: '',
  effectiveFrom: '',
  effectiveTo: '',
  isActive: true,
}