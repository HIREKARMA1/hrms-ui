const POLICY_LABELS: Record<string, string> = {
  officeStart: 'Office start',
  lateAfter: 'Late after',
  lunchStart: 'Lunch start',
  lunchEnd: 'Lunch end',
  lunchWindowStart: 'Lunch window start',
  lunchWindowEnd: 'Lunch window end',
  teaEarliest: 'Tea earliest',
  earlyLeaveFrom: 'Early leave from',
  officeEnd: 'Office end',
  halfDayFirstHalfEnd: 'Half day (1st half ends)',
  halfDaySecondHalfLatestIn: 'Half day (2nd half latest in)',
  overtimeStart: 'Overtime from',
  lunchMaxMinutes: 'Lunch max (min)',
  teaStandardMinutes: 'Tea standard (min)',
  teaMaxMinutes: 'Tea max (min)',
  punchDebounceSeconds: 'Punch debounce (sec)',
}

export function formatPolicyKey(key: string): string {
  return POLICY_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

export function policyEntries(
  policy?: Record<string, string | number | boolean>,
): [string, string][] {
  if (!policy) return []
  return Object.entries(policy).map(([key, value]) => [formatPolicyKey(key), String(value)])
}