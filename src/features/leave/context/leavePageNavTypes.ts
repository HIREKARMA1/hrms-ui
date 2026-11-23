/**
 * Cross-tab navigation intents for HR Admin (no URL routing).
 */

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'

export type HrRequestsSegment = 'action' | 'all' | 'encashment' | 'compoff'

export type LeavePageNavIntent = {
  tab: LeavePageTabId
  requestsSegment?: HrRequestsSegment
  requestsStatus?: string
  accrualConfirm?: boolean
}
