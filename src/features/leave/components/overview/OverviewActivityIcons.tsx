/**
 * Icon tiles and tones for Overview recent-activity event kinds.
 */

import { Ban, CheckCircle2, Clock, Send, Siren, Sparkles, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ActivityEventKind } from '../../utils/buildRecentActivity'

export const ACTIVITY_ICONS: Record<ActivityEventKind, { icon: LucideIcon; className: string }> = {
  applied: { icon: Send, className: 'text-[#3B82F6]' },
  approved: { icon: CheckCircle2, className: 'text-[#16A34A]' },
  rejected: { icon: XCircle, className: 'text-[#EF4444]' },
  cancelled: { icon: Ban, className: 'text-[#667085]' },
  escalated: { icon: Siren, className: 'text-[#F59E0B]' },
  adjustment: { icon: Clock, className: 'text-[#F59E0B]' },
  accrual: { icon: Sparkles, className: 'text-[#5938DB]' },
}

export const ACTIVITY_CHIP_STYLES: Record<ActivityEventKind, { className: string }> = {
  applied: { className: 'bg-[#3B82F61A] text-[#3B82F6]' },
  approved: { className: 'bg-[#16A34A1A] text-[#16A34A]' },
  rejected: { className: 'bg-[#EF44440F] text-[#EF4444]' },
  cancelled: { className: 'bg-[#EEF0F6] text-[#667085]' },
  escalated: { className: 'bg-[#F59E0B1F] text-[#F59E0B]' },
  adjustment: { className: 'bg-[#F59E0B1F] text-[#F59E0B]' },
  accrual: { className: 'bg-[#F0EDFF] text-[#5938DB]' },
}