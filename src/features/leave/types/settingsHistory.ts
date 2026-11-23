/**
 * Append-only audit log for saved Leave Settings changes.
 */

import type { LeaveSettingsSectionId } from '../constants/leaveSettingsSections'

export type SettingsHistoryEntry = {
  id: string
  savedAt: string
  userName: string
  section: LeaveSettingsSectionId
  summary: string
}
