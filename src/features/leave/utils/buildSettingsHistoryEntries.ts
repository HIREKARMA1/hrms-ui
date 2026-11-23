/**
 * Builds append-only history rows when Leave Settings are saved.
 */

import type { LeaveSettings } from '../types/leaveSettings'
import type { LeaveSettingsSectionId } from '../constants/leaveSettingsSections'
import type { SettingsHistoryEntry } from '../types/settingsHistory'
import { leaveSettingsSectionDirty } from './leaveSettingsSectionDiff'
import { leaveToday } from './leaveToday'

function id() {
  return `SET-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function summarizeSection(section: LeaveSettingsSectionId, before: LeaveSettings, after: LeaveSettings): string {
  if (section === 'general') {
    const parts: string[] = []
    if (before.leaveYearMode !== after.leaveYearMode) parts.push(`Leave year: ${before.leaveYearMode} → ${after.leaveYearMode}`)
    if (before.sandwichRule !== after.sandwichRule) parts.push(`Weekends between leave: ${before.sandwichRule}`)
    if (before.minProbationMonths !== after.minProbationMonths) parts.push(`Minimum service: ${after.minProbationMonths} months`)
    if (JSON.stringify(before.weeklyOffDays) !== JSON.stringify(after.weeklyOffDays)) parts.push('Weekly off days updated')
    return parts.join('; ') || 'General settings updated'
  }
  if (section === 'encashment') {
    return `Encashment: keep ${after.encashmentRules.minimumBalanceDays} days, max ${after.encashmentRules.maximumDaysPerYear}/year`
  }
  if (section === 'coverage') {
    return `Team coverage: max ${after.teamCoverage.maxSameDepartmentPerDay} (${after.teamCoverage.mode})`
  }
  if (section === 'holidays') return 'Holiday calendar updated'
  if (section === 'approvals') {
    return `Escalation after ${after.escalation.daysPendingBeforeEscalation} days pending`
  }
  if (section !== 'leave-types') {
    return `${section} updated`
  }
  const summaries: string[] = []
  for (const policy of after.leaveTypes) {
    const prev = before.leaveTypes.find((item) => item.code === policy.code)
    if (!prev || JSON.stringify(prev) === JSON.stringify(policy)) continue
    if (prev.annualQuotaDays !== policy.annualQuotaDays) {
      summaries.push(`${policy.label} yearly days: ${prev.annualQuotaDays ?? '—'} to ${policy.annualQuotaDays ?? '—'}`)
      continue
    }
    summaries.push(`${policy.label} policy updated`)
  }
  if (summaries.length === 1) return summaries[0]
  return summaries.length > 0 ? summaries.slice(0, 2).join('; ') : 'Leave types updated'
}

export function buildSettingsHistoryEntries(before: LeaveSettings, after: LeaveSettings, userName: string): SettingsHistoryEntry[] {
  const sections: LeaveSettingsSectionId[] = ['leave-types', 'general', 'approvals', 'holidays', 'encashment', 'coverage']
  const when = leaveToday().toISOString()
  return sections
    .filter((section) => leaveSettingsSectionDirty(after, before, section))
    .map((section) => ({
      id: id(),
      savedAt: when,
      userName,
      section,
      summary: summarizeSection(section, before, after),
    }))
}
