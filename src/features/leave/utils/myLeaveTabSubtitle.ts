/**
 * Subtitle copy for My Leave tab header by demo role.
 */

import type { UserRole } from '../constants/userRoles'
import { isEmployeeExperience, isManagerExperience } from '../constants/userRoles'

export function myLeaveTabSubtitle(role: UserRole): string {
  if (isEmployeeExperience(role)) return 'Track balances, upcoming leave, and your request history.'
  if (isManagerExperience(role)) return 'Your balances plus a snapshot of your direct reports.'
  return 'Balances, history, and new requests for your account.'
}
