import type { LeaveTypesListData } from '../types/api/leaveTypesList.types'
import type { LeaveSettings, LeaveTypePolicy } from '../types/leaveSettings'
import { defaultLeaveTypes } from '../services/defaultLeaveTypes'

function resolveCode(raw: string): string {
  return raw.trim().toUpperCase()
}

function resolveLabel(item: LeaveTypesListData['items'][number], fallback: string): string {
  return (item.name ?? item.label ?? fallback).trim() || fallback
}

function resolveEnabled(item: LeaveTypesListData['items'][number], fallback: boolean): boolean {
  if (typeof item.enabled === 'boolean') return item.enabled
  if (typeof item.isActive === 'boolean') return item.isActive
  return fallback
}

function policyTemplateForCode(
  code: string,
  settings: LeaveSettings,
): LeaveTypePolicy | undefined {
  return (
    settings.leaveTypes.find((row) => row.code === code) ??
    defaultLeaveTypes.find((row) => row.code === code)
  )
}

/** Merges API leave types into settings for Apply dialog validation + dropdown. */
export function mergeLeaveTypesForApply(
  settings: LeaveSettings,
  apiData: LeaveTypesListData | undefined,
): LeaveSettings {
  if (!apiData?.items.length) return settings

  const leaveTypes: LeaveTypePolicy[] = []

  for (const item of apiData.items) {
    const code = resolveCode(item.code)
    if (!code) continue
    const template = policyTemplateForCode(code, settings)
    if (!template) continue

    leaveTypes.push({
      ...template,
      code,
      label: resolveLabel(item, template.label),
      enabled: resolveEnabled(item, template.enabled),
      paid: typeof item.paid === 'boolean' ? item.paid : template.paid,
    })
  }

  if (!leaveTypes.length) return settings

  return { ...settings, leaveTypes }
}