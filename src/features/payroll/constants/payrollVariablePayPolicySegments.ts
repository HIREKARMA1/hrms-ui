/**
 * Sub-sections inside Payroll Settings → Variable pay policy (Phase 4).
 */

export const VARIABLE_PAY_POLICY_SEGMENTS = ['Overtime', 'Bonus', 'Statutory inclusion'] as const

export type VariablePayPolicySegmentId = (typeof VARIABLE_PAY_POLICY_SEGMENTS)[number]

export const VARIABLE_PAY_POLICY_SEGMENT_HINT: Record<VariablePayPolicySegmentId, string> = {
  Overtime: 'How overtime pay is calculated. Enter hours and approvals on the Variable Pay tab.',
  Bonus: 'Statutory bonus eligibility and percentages for bonus runs.',
  'Statutory inclusion': 'Whether overtime, bonus, and incentives count toward PF, ESI, and PT.',
}