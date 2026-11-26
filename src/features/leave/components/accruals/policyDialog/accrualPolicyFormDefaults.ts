import type { AccrualPolicyForm, CarryForwardPolicyForm } from '../../../utils/buildLeavePolicyApiBody'

export const EMPTY_ACCRUAL_POLICY_FORM: AccrualPolicyForm = {
  leaveTypeId: '',
  frequency: 'MONTHLY',
  accrualAmount: '',
  annualAllocationLimit: '',
  maxAccumulatedBalance: '',
  effectiveFrom: '',
  effectiveTo: '',
  isActive: true,
}

export const EMPTY_CARRY_FORWARD_POLICY_FORM: CarryForwardPolicyForm = {
  leaveTypeId: '',
  enabled: true,
  maxCarryForwardDays: '',
  expiryMonths: '',
  expiryNever: true,
  effectiveYear: '',
  isActive: true,
}