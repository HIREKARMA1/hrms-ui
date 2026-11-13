/**
 * Summary counts for the Super Admin Audit tab.
 */

import type { LeaveSnapshot } from '../services/leaveService'

export type SuperAdminAuditInsights = {
  totalEntries: number
  uniqueEditors: number
  lastSavedAt: string | null
  accrualRuns: number
  yearEndRuns: number
}

export function superAdminAuditInsights(snapshot: LeaveSnapshot): SuperAdminAuditInsights {
  const history = snapshot.settingsHistory
  const editors = new Set(history.map((item) => item.userName))
  const lastSavedAt = history.length
    ? [...history].sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0]?.savedAt ?? null
    : null

  return {
    totalEntries: history.length,
    uniqueEditors: editors.size,
    lastSavedAt,
    accrualRuns: snapshot.accrualRuns.length,
    yearEndRuns: snapshot.yearEndRuns.length,
  }
}
