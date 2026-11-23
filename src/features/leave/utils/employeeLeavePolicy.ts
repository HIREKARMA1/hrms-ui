/**
 * Policy gates for optional employee self-service actions on My Leave.
 */

import type { LeaveSettings } from '../types/leaveSettings'

export function canEarnCompOff(settings: LeaveSettings): boolean {
  const policy = settings.leaveTypes.find((item) => item.code === 'CO')
  return Boolean(policy?.enabled)
}

export function canRequestEncashment(settings: LeaveSettings): boolean {
  return settings.leaveTypes.some((item) => item.enabled && item.encashable)
}
