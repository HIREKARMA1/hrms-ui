/**
 * Feature key guarding each Leave tab. Single source for the sidebar child
 * items (rbac config) and the in-page guard (LeavePage), so a hidden sidebar
 * item is also denied when its URL is opened directly.
 *
 * Tabs listed here are enforced with the backend permission mapped in
 * FEATURE_PERMISSION_MAP. Tabs not listed (Audit, Access) have no backend
 * permission code; they stay governed by the role-specific tab list only.
 */

import type { FeatureAccessKey } from '@/features/rbac/types/features'

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'

export const LEAVE_TAB_FEATURES: Partial<Record<LeavePageTabId, FeatureAccessKey>> = {
  Overview: 'leave.overview',
  Requests: 'leave.requests',
  Calendar: 'leave.calendar',
  Balances: 'leave.balances',
  'Accruals & Year-End': 'leave.accruals',
  Reports: 'leave.reports',
  'Leave Settings': 'leave.types',
  'My Leave': 'leave.myLeave',
  Approvals: 'leave.approvals',
}

export function leaveTabFeature(tab: LeavePageTabId): FeatureAccessKey | undefined {
  return LEAVE_TAB_FEATURES[tab]
}
