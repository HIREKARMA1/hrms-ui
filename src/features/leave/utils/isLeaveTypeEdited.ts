/**
 * True when a leave type in the draft differs from the last saved settings.
 */

import type { LeaveSettings, LeaveTypePolicy } from '../types/leaveSettings'

export function isLeaveTypeEdited(draft: LeaveSettings, saved: LeaveSettings, code: string): boolean {
  const a = draft.leaveTypes.find((item) => item.code === code)
  const b = saved.leaveTypes.find((item) => item.code === code)
  if (!a || !b) return false
  return JSON.stringify(a) !== JSON.stringify(b)
}

export function findLeaveTypePolicy(settings: LeaveSettings, code: string): LeaveTypePolicy | undefined {
  return settings.leaveTypes.find((item) => item.code === code)
}
