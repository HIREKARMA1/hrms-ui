/**
 * Validates all Leave Settings sections before save; returns first failing section.
 */

import type { LeaveSettings } from '../types/leaveSettings'
import type { LeaveSettingsSectionId } from '../constants/leaveSettingsSections'

export type SettingsValidationIssue = {
  section: LeaveSettingsSectionId
  message: string
}

export function validateLeaveSettings(settings: LeaveSettings): SettingsValidationIssue[] {
  const issues: SettingsValidationIssue[] = []
  if (settings.weeklyOffDays.length === 0) {
    issues.push({ section: 'general', message: 'Select at least one weekly off day.' })
  }
  if (settings.encashmentRules.minimumBalanceDays < 0) {
    issues.push({ section: 'encashment', message: 'Minimum balance must be zero or more.' })
  }
  if (settings.encashmentRules.maximumDaysPerYear < 0) {
    issues.push({ section: 'encashment', message: 'Maximum days per year must be zero or more.' })
  }
  if (settings.teamCoverage.maxSameDepartmentPerDay < 1) {
    issues.push({ section: 'coverage', message: 'Maximum people on leave must be at least 1.' })
  }
  const dates = new Set<string>()
  for (const holiday of settings.holidays) {
    if (!holiday.name.trim()) {
      issues.push({ section: 'holidays', message: 'Every holiday needs a name.' })
      break
    }
    if (dates.has(holiday.date)) {
      issues.push({ section: 'holidays', message: 'Duplicate holiday dates are not allowed.' })
      break
    }
    dates.add(holiday.date)
  }
  for (const policy of settings.leaveTypes) {
    if (!policy.enabled) continue
    if (policy.carryForward === 'capped' && (policy.carryForwardCapDays ?? 0) < 1) {
      issues.push({ section: 'leave-types', message: `${policy.label}: carry-forward cap must be at least 1 day.` })
      break
    }
  }
  return issues
}

export function sectionHasError(issues: SettingsValidationIssue[], section: LeaveSettingsSectionId) {
  return issues.some((item) => item.section === section)
}
