/**
 * Per-section dirty flags comparing draft settings to last saved snapshot.
 */

import type { LeaveSettings } from '../types/leaveSettings'
import type { LeaveSettingsSectionId } from '../constants/leaveSettingsSections'

function jsonSlice<T>(value: T): string {
  return JSON.stringify(value)
}

export function leaveSettingsSectionDirty(draft: LeaveSettings, saved: LeaveSettings, section: LeaveSettingsSectionId): boolean {
  switch (section) {
    case 'leave-types':
      return jsonSlice(draft.leaveTypes) !== jsonSlice(saved.leaveTypes)
    case 'general':
      return (
        draft.leaveYearMode !== saved.leaveYearMode ||
        jsonSlice(draft.weeklyOffDays) !== jsonSlice(saved.weeklyOffDays) ||
        draft.sandwichRule !== saved.sandwichRule ||
        draft.minProbationMonths !== saved.minProbationMonths
      )
    case 'approvals':
      return jsonSlice(draft.leaveTypes) !== jsonSlice(saved.leaveTypes) || jsonSlice(draft.escalation) !== jsonSlice(saved.escalation)
    case 'holidays':
      return jsonSlice(draft.holidays) !== jsonSlice(saved.holidays)
    case 'encashment':
      return jsonSlice(draft.encashmentRules) !== jsonSlice(saved.encashmentRules)
    case 'coverage':
      return jsonSlice(draft.teamCoverage) !== jsonSlice(saved.teamCoverage)
    case 'history':
      return false
    default:
      return false
  }
}

export function countDirtySections(draft: LeaveSettings, saved: LeaveSettings): number {
  const ids: LeaveSettingsSectionId[] = ['leave-types', 'general', 'approvals', 'holidays', 'encashment', 'coverage']
  return ids.filter((id) => leaveSettingsSectionDirty(draft, saved, id)).length
}
