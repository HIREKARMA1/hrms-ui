/**
 * How a leave type earns balance (Leave Settings guided editor).
 */

export type LeaveEarningModel =
  | 'yearly_quota'
  | 'earned_monthly'
  | 'per_days_worked'
  | 'per_event'
  | 'comp_off'
  | 'unpaid'
