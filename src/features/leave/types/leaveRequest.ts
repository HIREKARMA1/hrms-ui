/**
 * Leave application, approval steps, and day-level segments on a request.
 * Used by My Leave, Approvals, and leaveService request APIs.
 */

export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

export type ApprovalLevel = 'Manager' | 'HR'

export type HalfDayPortion = 'full' | 'first_half' | 'second_half'

export type LeaveDaySegment = {
  date: string
  portion: HalfDayPortion
  countsAsLeave: boolean
}

export type LeaveStepKind =
  | 'applied'
  | 'approval'
  | 'rejection'
  | 'cancellation'
  | 'escalation'
  | 'delegation'

export type LeaveStep = {
  id: string
  kind: LeaveStepKind
  at: string
  actorId: string
  actorName: string
  level?: ApprovalLevel
  comment?: string
  onBehalfOfId?: string
  onBehalfOfName?: string
}

export type LeaveRequest = {
  id: string
  employeeId: string
  leaveTypeCode: string
  fromDate: string
  toDate: string
  days: number
  lwpDays?: number
  segments: LeaveDaySegment[]
  firstDayHalf?: boolean
  lastDayHalf?: boolean
  reason: string
  attachmentName?: string
  appliedOn: string
  status: LeaveRequestStatus
  currentLevel: ApprovalLevel | null
  currentStepLabel: string
  escalated: boolean
  maternityChildNumber?: number
  expectedDeliveryDate?: string
  compOffLotIds?: string[]
  convertedToLwp?: boolean
  /** Server requests on a multi-level approval workflow (only the assigned approver can act). */
  multiLevelWorkflow?: boolean
  steps: LeaveStep[]
}
