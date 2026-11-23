/**
 * Extra line on balance cards for per-event leave types.
 */

import type { LeaveTypePolicy } from '../types/leaveSettings'
import { resolveEarningModel } from './leaveEarningModel'

export function balanceCardHint(policy: LeaveTypePolicy | undefined): string | undefined {
  if (!policy || !policy.enabled) return undefined
  if (resolveEarningModel(policy) !== 'per_event') return undefined
  if (policy.annualQuotaDays == null) return 'Up to per event limit'
  return `Up to ${policy.annualQuotaDays} days per event`
}
