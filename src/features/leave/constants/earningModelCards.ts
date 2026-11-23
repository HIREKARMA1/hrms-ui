/**
 * Selectable earning model cards in the leave type edit dialog.
 */

import { Baby, Ban, CalendarClock, CalendarDays, Clock, Sun, type LucideIcon } from 'lucide-react'

import type { LeaveEarningModel } from '../types/leaveEarningModel'

export type EarningModelCard = {
  id: LeaveEarningModel
  title: string
  sentence: string
  icon: LucideIcon
}

export const EARNING_MODEL_CARDS: EarningModelCard[] = [
  { id: 'yearly_quota', title: 'Yearly quota', sentence: 'Credited at the start of the leave year.', icon: CalendarDays },
  { id: 'earned_monthly', title: 'Earned every month', sentence: 'Credited a little each month.', icon: CalendarClock },
  { id: 'per_days_worked', title: 'Earned by days worked', sentence: 'For example 1 day for every 20 days worked.', icon: Clock },
  { id: 'per_event', title: 'Per event', sentence: 'A fixed number of days each time (maternity, marriage).', icon: Baby },
  { id: 'comp_off', title: 'Earned by working on a holiday', sentence: 'Compensatory off with an expiry date.', icon: Sun },
  { id: 'unpaid', title: 'Unpaid, no balance', sentence: 'Leave without pay.', icon: Ban },
]
