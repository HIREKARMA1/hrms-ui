/**
 * Backend leave contracts, transcribed from hrms-server source:
 * leaves/, leave-types/, leave-policies/, leave-encashments/,
 * employee-leave-policies/ and leave-approval/ (controllers, dto/*.schema.ts,
 * *.mapper.ts and the service return types).
 *
 * Every leave endpoint uses the `{ success, message, data }` envelope.
 * Dates typed as `string` are `YYYY-MM-DD` unless noted as ISO timestamps.
 */

export type BackendLeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type BackendDayPortion = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'

export type BackendEncashmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type BackendAccrualFrequency = 'MONTHLY' | 'YEARLY'

export type BackendGrantMode = 'MONTHLY_ACCRUAL' | 'ANNUAL_GRANT'

export type BackendPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type BackendPage<T> = {
  items: T[]
  pagination: BackendPagination
}

// ---------------------------------------------------------------------------
// /leaves
// ---------------------------------------------------------------------------

/** leaves.mapper.ts `LeaveRequestResponse`. Timestamps are ISO strings. */
export type BackendLeaveRequest = {
  id: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  dayPortion: BackendDayPortion
  totalDays: number
  reason: string | null
  status: BackendLeaveStatus
  appliedByUserId: string
  reviewedByUserId: string | null
  reviewedAt: string | null
  reviewNote: string | null
  cancelledAt: string | null
  cancelReason: string | null
  paidDays: number
  lopDays: number
  workflowId: string | null
  currentLevel: number | null
  createdAt: string
  updatedAt: string
  leaveType: { id: string; code: string; name: string; isPaid: boolean } | null
  employee: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
  } | null
}

/** GET /leaves query (listLeavesSchema, strict). `limit` max 100. */
export type ListLeavesArgs = {
  page?: number
  limit?: number
  employeeId?: string
  status?: BackendLeaveStatus
  leaveTypeId?: string
}

/** POST /leaves body (applyLeaveSchema, strict). */
export type ApplyLeaveBody = {
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  dayPortion: BackendDayPortion
  reason?: string
}

/** POST /leaves/:id/approve|reject body (reviewLeaveSchema, strict). */
export type ReviewLeaveBody = { note?: string }

/** POST /leaves/:id/cancel body (cancelLeaveSchema, strict). */
export type CancelLeaveBody = { reason?: string }

/** leaves.mapper.ts `LeaveBalanceItem`. */
export type BackendLeaveBalanceItem = {
  employeeId: string
  employeeName: string
  leaveTypeId: string
  leaveTypeName: string
  year: number
  totalAllocated: number
  usedLeaves: number
  pendingLeaves: number
  availableLeaves: number
}

/** GET /leaves/balance/:employeeId `data`. */
export type BackendLeaveBalance = {
  employeeId: string
  employeeName: string
  items: BackendLeaveBalanceItem[]
}

/** GET /leaves/history/:employeeId item. */
export type BackendLeaveHistoryItem = BackendLeaveRequest & {
  reviewer: { id: string; email: string } | null
}

/** GET /leaves/history/:employeeId query (leaveHistoryQuerySchema, strict). */
export type LeaveHistoryArgs = {
  employeeId: string
  page?: number
  limit?: number
  status?: BackendLeaveStatus
  leaveTypeId?: string
  startDate?: string
  endDate?: string
  year?: number
}

/** leaves.mapper.ts `LeaveCalendarItem` (APPROVED only). */
export type BackendLeaveCalendarItem = {
  id: string
  employeeId: string
  employeeName: string
  leaveTypeId: string
  leaveTypeName: string
  startDate: string
  endDate: string
  dayPortion: BackendDayPortion
  totalDays: number
  status: BackendLeaveStatus
}

export type BackendLeaveCalendar = {
  items: BackendLeaveCalendarItem[]
  range: { startDate: string; endDate: string }
}

/** GET /leaves/calendar[/team] query (leaveCalendarQuerySchema, strict). */
export type LeaveCalendarArgs = {
  year?: number
  month?: number
  startDate?: string
  endDate?: string
}

// ---------------------------------------------------------------------------
// /leave-types
// ---------------------------------------------------------------------------

/** leave-types.mapper.ts `LeaveTypeResponse`. */
export type BackendLeaveType = {
  id: string
  code: string
  name: string
  description: string | null
  isPaid: boolean
  isActive: boolean
  requiresApproval: boolean
  maxAllowedDays: number | null
  createdAt: string
  updatedAt: string
  requestCount: number
  balanceCount: number
}

/** GET /leave-types query (listLeaveTypesSchema, strict). */
export type ListLeaveTypesArgs = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  isPaid?: boolean
}

// ---------------------------------------------------------------------------
// /leave-policies
// ---------------------------------------------------------------------------

export type BackendLeaveTypeRef = { id: string; code: string; name: string }

/** leave-policies.mapper.ts `AccrualPolicyResponse`. */
export type BackendAccrualPolicy = {
  id: string
  leaveTypeId: string
  frequency: BackendAccrualFrequency
  accrualAmount: number
  annualAllocationLimit: number | null
  maxAccumulatedBalance: number | null
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  leaveType: BackendLeaveTypeRef | null
}

/** leave-policies.mapper.ts `CarryForwardPolicyResponse`. */
export type BackendCarryForwardPolicy = {
  id: string
  leaveTypeId: string
  enabled: boolean
  maxCarryForwardDays: number
  expiryMonths: number | null
  effectiveYear: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  leaveType: BackendLeaveTypeRef | null
}

/** POST /leave-policies/accrual/run body (runAccrualSchema, strict). */
export type RunAccrualBody = { asOfDate?: string; leaveTypeId?: string; employeeId?: string }

/** leave-policies.mapper.ts `AccrualRunResult`. */
export type BackendAccrualRunResult = {
  processedEmployees: number
  accruedCount: number
  skippedManual: number
  skippedDuplicate: number
  skippedIneligible: number
  periodKey: string
}

/** POST /leave-policies/carry-forward/run body (runCarryForwardSchema, strict). */
export type RunCarryForwardBody = { fromYear: number; toYear?: number; leaveTypeId?: string }

/** leave-policies.mapper.ts `CarryForwardRunResult`. */
export type BackendCarryForwardRunResult = {
  processedBalances: number
  carriedCount: number
  skippedDisabled: number
  skippedDuplicate: number
  fromYear: number
  toYear: number
}

/** POST /leave-policies/carry-forward/expire body (expireCarryForwardSchema, strict). */
export type ExpireCarryForwardBody = { year: number; asOfDate?: string; leaveTypeId?: string }

/** Only the two counters are read from the expiry response. */
export type BackendCarryForwardExpiryResult = {
  expiredCount: number
  skippedDuplicate: number
}

// ---------------------------------------------------------------------------
// /leave-encashments
// ---------------------------------------------------------------------------

/** leave-encashments.mapper.ts `EncashmentRequestResponse`. */
export type BackendEncashment = {
  id: string
  employeeId: string
  leaveTypeId: string
  policyId: string
  year: number
  days: number
  ratePerDay: number
  amount: number
  currency: string
  reason: string | null
  status: BackendEncashmentStatus
  appliedByUserId: string
  reviewedByUserId: string | null
  reviewedAt: string | null
  reviewNote: string | null
  cancelledAt: string | null
  cancelReason: string | null
  balanceDeducted: boolean
  createdAt: string
  updatedAt: string
  leaveType: BackendLeaveTypeRef | null
  employee: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
  } | null
}

/** GET /leave-encashments query (listEncashmentsSchema, strict). */
export type ListEncashmentsArgs = {
  page?: number
  limit?: number
  employeeId?: string
  leaveTypeId?: string
  status?: BackendEncashmentStatus
  year?: number
}

/** POST /leave-encashments body (createEncashmentSchema, strict). */
export type CreateEncashmentBody = {
  employeeId: string
  leaveTypeId: string
  days: number
  year?: number
  reason?: string
}

/** POST /leave-encashments/:id/approve|reject body (reviewEncashmentSchema). */
export type ReviewEncashmentBody = { note?: string }

/** POST /leave-encashments/:id/cancel body (cancelEncashmentSchema). */
export type CancelEncashmentBody = { reason?: string }

/** leave-encashments.mapper.ts `EncashmentPolicyResponse`. */
export type BackendEncashmentPolicy = {
  id: string
  leaveTypeId: string
  ratePerDay: number
  currency: string
  minDays: number
  maxDaysPerRequest: number
  maxDaysPerYear: number | null
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  leaveType: BackendLeaveTypeRef | null
}

// ---------------------------------------------------------------------------
// /employee-leave-policies
// ---------------------------------------------------------------------------

/** GET /employee-leave-policies/defaults item (data is a bare array). */
export type BackendLeavePolicyDefault = {
  id: string
  leaveTypeId: string
  leaveTypeCode: string
  leaveTypeName: string
  annualEntitlement: number
  monthlyAccrualAmount: number
  grantMode: BackendGrantMode
  isActive: boolean
}

/** POST /employee-leave-policies/adjustments body (adjustLeaveBalanceSchema, strict). */
export type AdjustLeaveBalanceBody = {
  employeeId: string
  leaveTypeId: string
  year: number
  amount: number
  reason: string
}

/** POST /employee-leave-policies/adjustments `data`. */
export type BackendLeaveAdjustment = {
  id: string
  employeeId: string
  leaveTypeId: string
  year: number
  amount: number
  reason: string
  entitledDays: number
}

// ---------------------------------------------------------------------------
// /leave-approval (multi-level workflow)
// ---------------------------------------------------------------------------

/** leave-approval.mapper.ts `ApprovalHistoryResponse`. */
export type BackendApprovalHistoryItem = {
  id: string
  leaveRequestId: string
  levelNumber: number
  approverEmployeeId: string
  approverUserId: string
  action: 'APPROVED' | 'REJECTED'
  comments: string | null
  actedAt: string
  approverEmployee: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
  } | null
}

/** GET /leave-approval/history/:leaveRequestId `data`. */
export type BackendApprovalHistory = {
  leaveRequestId: string
  items: BackendApprovalHistoryItem[]
}
