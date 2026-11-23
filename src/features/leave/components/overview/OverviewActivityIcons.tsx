/**
 * Icon tiles and tones for Overview recent-activity event kinds.
 */

import { Ban, CheckCircle2, Clock, Send, Siren, Sparkles, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ActivityEventKind } from '../../utils/buildRecentActivity'

export const ACTIVITY_ICONS: Record<ActivityEventKind, { icon: LucideIcon; className: string }> = {
  applied: { icon: Send, className: 'bg-hrms-info/10 text-hrms-info' },
  approved: { icon: CheckCircle2, className: 'bg-hrms-success/10 text-hrms-success' },
  rejected: { icon: XCircle, className: 'bg-hrms-danger/10 text-hrms-danger' },
  cancelled: { icon: Ban, className: 'bg-hrms-muted-bg text-hrms-text-secondary' },
  escalated: { icon: Siren, className: 'bg-hrms-warning/10 text-hrms-warning' },
  adjustment: { icon: Clock, className: 'bg-hrms-lavender text-hrms-primary' },
  accrual: { icon: Sparkles, className: 'bg-hrms-primary/10 text-hrms-primary' },
}
