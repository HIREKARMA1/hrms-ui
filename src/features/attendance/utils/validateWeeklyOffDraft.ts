/**
 * Client validation before POST /calendar/weekly-offs.
 */
import {
  MAX_WEEKLY_OFF_RULES,
  type WeeklyOffRule,
} from '@/features/officeCalendar/types/api/weeklyOffs.types'

import { weeklyOffRuleKey } from './weeklyOffRuleLabels'

export type WeeklyOffDraftValidation = { ok: true } | { ok: false; message: string }

export function validateWeeklyOffDraft(rules: WeeklyOffRule[]): WeeklyOffDraftValidation {
  if (rules.length > MAX_WEEKLY_OFF_RULES) {
    return { ok: false, message: `At most ${MAX_WEEKLY_OFF_RULES} rules are allowed.` }
  }
  const seen = new Set<string>()
  for (const rule of rules) {
    const key = weeklyOffRuleKey(rule)
    if (seen.has(key)) {
      return { ok: false, message: 'Duplicate rules are not allowed.' }
    }
    seen.add(key)
  }
  return { ok: true }
}