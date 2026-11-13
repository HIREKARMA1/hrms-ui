/**
 * "Used in" chips shown at the top of each Leave Settings section.
 */

import type { LeaveSettingsSectionId } from './leaveSettingsSections'

export const LEAVE_SETTINGS_SECTION_USES: Record<LeaveSettingsSectionId, string[]> = {
  'leave-types': ['Apply for leave', 'Balances', 'Approvals'],
  general: ['Apply for leave', 'Calendar'],
  approvals: ['Approvals', 'Apply for leave'],
  holidays: ['Calendar', 'Apply for leave'],
  encashment: ['My Leave', 'Balances'],
  coverage: ['Apply for leave', 'Approvals'],
  history: ['Leave Settings'],
}
