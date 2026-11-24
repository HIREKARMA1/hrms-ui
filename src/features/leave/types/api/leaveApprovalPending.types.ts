import type { ApiLeaveRequestItem } from './leaveList.types'

/** Response from `GET /leave-approval/pending` (listPending). */
export type LeaveApprovalPendingData = {
  items: ApiLeaveRequestItem[]
}