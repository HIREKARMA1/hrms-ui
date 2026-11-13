/**
 * Tinted chip classes per leave type code for tables and calendar.
 * Reuses existing hrms palette tokens only.
 */

import type { LeaveTypeCode } from './leaveTypeCodes'

export const leaveTypeChipClasses: Record<LeaveTypeCode, string> = {
  CL: 'bg-hrms-info/10 text-hrms-navy',
  SL: 'bg-hrms-warning/10 text-hrms-navy',
  EL: 'bg-hrms-success/10 text-hrms-navy',
  PL: 'bg-hrms-lavender text-hrms-primary',
  LWP: 'bg-hrms-muted-bg text-hrms-text-secondary',
  MAT: 'bg-hrms-danger/10 text-hrms-navy',
  PAT: 'bg-hrms-info/10 text-hrms-navy',
  CO: 'bg-hrms-primary/10 text-hrms-navy',
  MAR: 'bg-hrms-warning/10 text-hrms-navy',
  BER: 'bg-hrms-muted-bg text-hrms-navy',
}
