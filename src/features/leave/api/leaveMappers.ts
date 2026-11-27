/**
 * Mapping between the backend leave contracts (leaveApi.types.ts) and the
 * frontend leave models used by the existing Leave screens.
 *
 * Every reader validates the server shape and returns null for anything
 * malformed instead of guessing, so a contract mismatch surfaces as an error
 * rather than as silently wrong data.
 */

import type { EmploymentStatus } from '../constants/employmentStatuses'
import type { LeaveEmployee } from '../types/employee'
import type { EncashmentRequest, EncashmentStatus } from '../types/encashment'
import type {
  HalfDayPortion,
  LeaveDaySegment,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveStep,
} from '../types/leaveRequest'
import type { LeaveSettings, LeaveTypePolicy } from '../types/leaveSettings'
import type { CalendarLeaveDayEntry } from '../utils/buildCalendarLeaveByDay'
import { createDefaultLeaveSettings } from '../services/companyDefaults'
import type {
  AdjustLeaveBalanceBody,
  ApplyLeaveBody,
  BackendAccrualRunResult,
  BackendCarryForwardExpiryResult,
  BackendCarryForwardRunResult,
  BackendDayPortion,
  BackendEncashment,
  BackendEncashmentStatus,
  BackendLeaveBalance,
  BackendLeaveCalendar,
  BackendLeaveCalendarItem,
  BackendLeaveRequest,
  BackendLeaveStatus,
  BackendLeaveType,
  BackendPagination,
} from './leaveApi.types'

// ---------------------------------------------------------------------------
// Primitive readers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/** A real calendar date in `YYYY-MM-DD` form (rejects 2026-02-30). */
export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = DATE_ONLY.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/**
 * `YYYY-MM-DD` from a backend date-only string or an ISO timestamp.
 * Timestamps keep their UTC calendar day, matching the server's
 * `toISOString().slice(0, 10)`. Anything else is null.
 */
export function toDateOnly(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (isDateOnly(value)) return value
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

/** Inclusive `YYYY-MM-DD` dates between two date-only strings (UTC arithmetic). */
export function eachDateInRange(start: string, end: string): string[] {
  if (!isDateOnly(start) || !isDateOnly(end) || start > end) return []
  const out: string[] = []
  const cursor = new Date(`${start}T00:00:00.000Z`)
  const last = new Date(`${end}T00:00:00.000Z`).getTime()
  while (cursor.getTime() <= last) {
    out.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const LEAVE_STATUS_TO_UI: Record<BackendLeaveStatus, LeaveRequestStatus> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const LEAVE_STATUS_TO_BACKEND: Record<LeaveRequestStatus, BackendLeaveStatus> = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Cancelled: 'CANCELLED',
}

export function toUiLeaveStatus(status: unknown): LeaveRequestStatus | null {
  return typeof status === 'string' && status in LEAVE_STATUS_TO_UI
    ? LEAVE_STATUS_TO_UI[status as BackendLeaveStatus]
    : null
}

export function toBackendLeaveStatus(status: LeaveRequestStatus): BackendLeaveStatus {
  return LEAVE_STATUS_TO_BACKEND[status]
}

/**
 * The backend encashment lifecycle ends at APPROVED: there is no payout state,
 * so 'Pending payout' / 'Paid via payroll' never come from the server.
 */
const ENCASHMENT_STATUS_TO_UI: Record<BackendEncashmentStatus, EncashmentStatus> = {
  PENDING: 'Pending approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export function toUiEncashmentStatus(status: unknown): EncashmentStatus | null {
  return typeof status === 'string' && status in ENCASHMENT_STATUS_TO_UI
    ? ENCASHMENT_STATUS_TO_UI[status as BackendEncashmentStatus]
    : null
}

// ---------------------------------------------------------------------------
// Half-day
// ---------------------------------------------------------------------------

const PORTION_TO_BACKEND: Record<HalfDayPortion, BackendDayPortion> = {
  full: 'FULL_DAY',
  first_half: 'FIRST_HALF',
  second_half: 'SECOND_HALF',
}

const PORTION_FROM_BACKEND: Record<BackendDayPortion, HalfDayPortion> = {
  FULL_DAY: 'full',
  FIRST_HALF: 'first_half',
  SECOND_HALF: 'second_half',
}

export function toDayPortion(portion: HalfDayPortion | undefined): BackendDayPortion {
  return PORTION_TO_BACKEND[portion ?? 'full']
}

export function fromDayPortion(dayPortion: unknown): HalfDayPortion | null {
  return typeof dayPortion === 'string' && dayPortion in PORTION_FROM_BACKEND
    ? PORTION_FROM_BACKEND[dayPortion as BackendDayPortion]
    : null
}

export function halfDayLabel(portion: HalfDayPortion): string | null {
  if (portion === 'first_half') return 'First half'
  if (portion === 'second_half') return 'Second half'
  return null
}

// ---------------------------------------------------------------------------
// Envelope and pagination
// ---------------------------------------------------------------------------

/** `data` from a `{ success: true, data }` envelope; undefined for anything else. */
export function readEnvelopeData(body: unknown): unknown {
  if (!isRecord(body) || body.success !== true || !('data' in body)) return undefined
  return body.data
}

export function readPagination(value: unknown): BackendPagination | null {
  if (!isRecord(value)) return null
  const { page, limit, total, totalPages } = value
  if (![page, limit, total, totalPages].every(isFiniteNumber)) return null
  return { page, limit, total, totalPages } as BackendPagination
}

export type MappedPage<T> = { items: T[]; pagination: BackendPagination }

/**
 * `{ items, pagination }` with every item mapped. Items the mapper rejects are
 * dropped; a missing array or pagination block rejects the whole page.
 */
export function readPage<T>(data: unknown, mapItem: (item: unknown) => T | null): MappedPage<T> | null {
  if (!isRecord(data) || !Array.isArray(data.items)) return null
  const pagination = readPagination(data.pagination)
  if (!pagination) return null
  const items = data.items.map(mapItem).filter((item): item is T => item !== null)
  return { items, pagination }
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

type EmbeddedEmployee = { id: string; firstName: string; lastName: string }

function readEmbeddedEmployee(value: unknown): EmbeddedEmployee | null {
  if (!isRecord(value) || !isNonEmptyString(value.id)) return null
  return {
    id: value.id,
    firstName: typeof value.firstName === 'string' ? value.firstName : '',
    lastName: typeof value.lastName === 'string' ? value.lastName : '',
  }
}

function embeddedName(employee: EmbeddedEmployee | null): string {
  return employee ? `${employee.firstName} ${employee.lastName}`.trim() : ''
}

/**
 * A leave-screen employee from the `employee` block embedded in leave and
 * encashment responses. That block carries no department, gender, joining
 * date or status, so those stay empty / neutral rather than being invented.
 */
export function leaveEmployeeFromEmbed(value: unknown): LeaveEmployee | null {
  const employee = readEmbeddedEmployee(value)
  if (!employee) return null
  return {
    id: employee.id,
    name: embeddedName(employee) || employee.id,
    department: '',
    gender: 'Other',
    joiningDate: '',
    managerId: null,
    employmentStatus: 'ACTIVE',
  }
}

const DIRECTORY_STATUS: Record<string, Exclude<EmploymentStatus, 'ON_LEAVE'>> = {
  Active: 'ACTIVE',
  'On Leave': 'ACTIVE',
  Probation: 'PROBATION',
  Terminated: 'TERMINATED',
}

/** A leave-screen employee from a mapped `/employees` record (Stage 4.6 EmployeeRecord). */
export function leaveEmployeeFromDirectory(record: {
  server: { id: string }
  profile: {
    firstName: string
    lastName: string
    employeeCode?: string
    employeeId?: string
    department: string
    designation: string
    dateOfJoining: string
    employmentStatus: string
  }
}): LeaveEmployee {
  const { profile } = record
  const code = profile.employeeCode?.trim() || profile.employeeId?.trim() || undefined
  return {
    id: record.server.id,
    employeeCode: code,
    name: `${profile.firstName} ${profile.lastName}`.trim() || record.server.id,
    department: profile.department,
    gender: 'Other',
    joiningDate: isDateOnly(profile.dateOfJoining) ? profile.dateOfJoining : '',
    managerId: null,
    roleTitle: profile.designation || undefined,
    employmentStatus: DIRECTORY_STATUS[profile.employmentStatus] ?? 'ACTIVE',
  }
}

/** Directory records win over embedded stubs; order follows first appearance. */
export function mergeLeaveEmployees(...lists: LeaveEmployee[][]): LeaveEmployee[] {
  const byId = new Map<string, LeaveEmployee>()
  for (const list of lists) {
    for (const employee of list) {
      const existing = byId.get(employee.id)
      if (!existing || (!existing.department && employee.department)) byId.set(employee.id, employee)
    }
  }
  return [...byId.values()]
}

// ---------------------------------------------------------------------------
// Leave requests
// ---------------------------------------------------------------------------

function buildSegments(fromDate: string, toDate: string, portion: HalfDayPortion): LeaveDaySegment[] {
  if (fromDate === toDate) return [{ date: fromDate, portion, countsAsLeave: true }]
  return eachDateInRange(fromDate, toDate).map((date) => ({ date, portion: 'full', countsAsLeave: true }))
}

/** Reviewer and applicant user ids are not resolvable to names, so actor names stay empty. */
function buildSteps(dto: {
  id: string
  appliedOn: string
  appliedByUserId: string
  status: LeaveRequestStatus
  reason: string
  reviewedAt: string | null
  reviewedByUserId: string | null
  reviewNote: string | null
  cancelledAt: string | null
  cancelReason: string | null
}): LeaveStep[] {
  const steps: LeaveStep[] = [
    { id: `${dto.id}-applied`, kind: 'applied', at: dto.appliedOn, actorId: dto.appliedByUserId, actorName: '', comment: dto.reason || undefined },
  ]
  if (dto.status === 'Cancelled') {
    steps.push({
      id: `${dto.id}-cancelled`,
      kind: 'cancellation',
      at: dto.cancelledAt ?? dto.reviewedAt ?? dto.appliedOn,
      actorId: dto.reviewedByUserId ?? '',
      actorName: '',
      comment: dto.cancelReason ?? undefined,
    })
  } else if ((dto.status === 'Approved' || dto.status === 'Rejected') && dto.reviewedAt) {
    steps.push({
      id: `${dto.id}-reviewed`,
      kind: dto.status === 'Approved' ? 'approval' : 'rejection',
      at: dto.reviewedAt,
      actorId: dto.reviewedByUserId ?? '',
      actorName: '',
      comment: dto.reviewNote ?? undefined,
    })
  }
  return steps
}

/**
 * Maps a backend leave request to the frontend model. Single-level PENDING
 * requests sit in the HR queue (`currentLevel: 'HR'`); requests on a
 * multi-level workflow have no HR step because only the assigned workflow
 * approver can act on them (POST /leave-approval/:id/approve).
 */
export function mapLeaveRequest(value: unknown): LeaveRequest | null {
  if (!isRecord(value)) return null
  const status = toUiLeaveStatus(value.status)
  const fromDate = toDateOnly(value.startDate)
  const toDate = toDateOnly(value.endDate)
  const portion = fromDayPortion(value.dayPortion)
  const appliedOn = toDateOnly(value.createdAt)
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.employeeId) ||
    !isNonEmptyString(value.leaveTypeId) ||
    !status ||
    !fromDate ||
    !toDate ||
    fromDate > toDate ||
    !portion ||
    !appliedOn ||
    !isFiniteNumber(value.totalDays)
  ) {
    return null
  }

  const dto = value as unknown as BackendLeaveRequest
  const leaveType = isRecord(dto.leaveType) && isNonEmptyString(dto.leaveType.code) ? dto.leaveType : null
  const lopDays = isFiniteNumber(dto.lopDays) ? dto.lopDays : 0
  const workflowLevel = dto.workflowId && isFiniteNumber(dto.currentLevel) ? dto.currentLevel : null
  const multiLevelWorkflow = Boolean(dto.workflowId)
  const reason = typeof dto.reason === 'string' ? dto.reason : ''
  const reviewedAt = toDateOnly(dto.reviewedAt)
  const cancelledAt = toDateOnly(dto.cancelledAt)

  let currentLevel: LeaveRequest['currentLevel'] = null
  let currentStepLabel: string = status
  if (status === 'Pending') {
    if (multiLevelWorkflow) {
      currentStepLabel = workflowLevel ? `Pending: level ${workflowLevel}` : 'Pending'
    } else {
      currentLevel = 'HR'
      currentStepLabel = 'Pending: HR'
    }
  }

  return {
    id: dto.id,
    employeeId: dto.employeeId,
    leaveTypeCode: leaveType?.code ?? dto.leaveTypeId,
    fromDate,
    toDate,
    days: dto.totalDays,
    lwpDays: lopDays > 0 ? lopDays : undefined,
    segments: buildSegments(fromDate, toDate, portion),
    reason,
    appliedOn,
    status,
    currentLevel,
    currentStepLabel,
    escalated: false,
    convertedToLwp: lopDays > 0 ? true : undefined,
    multiLevelWorkflow: multiLevelWorkflow || undefined,
    steps: buildSteps({
      id: dto.id,
      appliedOn,
      appliedByUserId: stringOrNull(dto.appliedByUserId) ?? '',
      status,
      reason,
      reviewedAt,
      reviewedByUserId: stringOrNull(dto.reviewedByUserId),
      reviewNote: stringOrNull(dto.reviewNote),
      cancelledAt,
      cancelReason: stringOrNull(dto.cancelReason),
    }),
  }
}

/** The single-day half-day portion of a mapped request, or 'full'. */
export function requestPortion(request: Pick<LeaveRequest, 'fromDate' | 'toDate' | 'segments'>): HalfDayPortion {
  if (request.fromDate !== request.toDate) return 'full'
  return request.segments[0]?.portion ?? 'full'
}

// ---------------------------------------------------------------------------
// Encashments
// ---------------------------------------------------------------------------

export function mapEncashment(value: unknown): EncashmentRequest | null {
  if (!isRecord(value)) return null
  const status = toUiEncashmentStatus(value.status)
  const appliedOn = toDateOnly(value.createdAt)
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.employeeId) ||
    !isNonEmptyString(value.leaveTypeId) ||
    !status ||
    !appliedOn ||
    !isFiniteNumber(value.days)
  ) {
    return null
  }
  const dto = value as unknown as BackendEncashment
  const code = isRecord(dto.leaveType) && isNonEmptyString(dto.leaveType.code) ? dto.leaveType.code : dto.leaveTypeId
  const reviewedOn = status === 'Approved' ? toDateOnly(dto.reviewedAt) : null
  return {
    id: dto.id,
    employeeId: dto.employeeId,
    leaveTypeCode: code,
    days: dto.days,
    appliedOn,
    status,
    approvedOn: reviewedOn ?? undefined,
    amount: isFiniteNumber(dto.amount) ? dto.amount : undefined,
    currency: isNonEmptyString(dto.currency) ? dto.currency : undefined,
  }
}

// ---------------------------------------------------------------------------
// Leave types and settings
// ---------------------------------------------------------------------------

export type LeaveTypeOption = {
  id: string
  code: string
  name: string
  description: string | null
  isPaid: boolean
  isActive: boolean
  requiresApproval: boolean
  maxAllowedDays: number | null
  requestCount: number
  balanceCount: number
}

export function mapLeaveType(value: unknown): LeaveTypeOption | null {
  if (!isRecord(value)) return null
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.code) ||
    !isNonEmptyString(value.name) ||
    typeof value.isPaid !== 'boolean' ||
    typeof value.isActive !== 'boolean'
  ) {
    return null
  }
  const dto = value as unknown as BackendLeaveType
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: stringOrNull(dto.description),
    isPaid: dto.isPaid,
    isActive: dto.isActive,
    requiresApproval: dto.requiresApproval !== false,
    maxAllowedDays: isFiniteNumber(dto.maxAllowedDays) ? dto.maxAllowedDays : null,
    requestCount: isFiniteNumber(dto.requestCount) ? dto.requestCount : 0,
    balanceCount: isFiniteNumber(dto.balanceCount) ? dto.balanceCount : 0,
  }
}

/**
 * Apply-time rules for a server leave type. The backend stores no notice,
 * gender, probation, certificate or consecutive-day rules, and counts every
 * calendar day in the range, so those checks are neutral here. It splits
 * days beyond the paid balance into loss of pay itself (`allowLwpConversion`).
 */
export function leaveTypeToPolicy(type: LeaveTypeOption): LeaveTypePolicy {
  return {
    code: type.code,
    label: type.name,
    enabled: type.isActive,
    paid: type.isPaid,
    earningModel: type.isPaid ? 'yearly_quota' : 'unpaid',
    annualQuotaDays: null,
    perEventDaysFromThirdChild: null,
    accrualMethod: 'upfront',
    daysWorkedPerAccrualDay: null,
    qualifyingDays: null,
    dayCounting: 'calendar',
    halfDayAllowed: true,
    maxConsecutiveDays: null,
    minNoticeDays: 0,
    backdatingAllowedDays: 0,
    medicalCertificateAfterDays: null,
    eligibleGender: 'All',
    minServiceMonths: 0,
    carryForward: 'none',
    carryForwardCapDays: null,
    encashable: false,
    allowLwpConversion: true,
    compOffExpiryDays: null,
    approvalChain: 'hr',
    managerOnlyUpToDays: null,
  }
}

/**
 * Settings for screens driven by server data. Company calendars and team
 * coverage limits are not stored on the backend, so holidays are empty and
 * coverage only warns.
 */
export function buildServerLeaveSettings(types: LeaveTypeOption[]): LeaveSettings {
  const defaults = createDefaultLeaveSettings()
  return {
    ...defaults,
    leaveYearMode: 'jan_dec',
    sandwichRule: 'exclude',
    minProbationMonths: 0,
    leaveTypes: types.map(leaveTypeToPolicy),
    teamCoverage: { maxSameDepartmentPerDay: Number.MAX_SAFE_INTEGER, mode: 'warn' },
    holidays: [],
  }
}

// ---------------------------------------------------------------------------
// Balances
// ---------------------------------------------------------------------------

export type LeaveBalanceRow = {
  leaveTypeId: string
  leaveTypeCode: string
  leaveTypeName: string
  year: number
  allocated: number
  used: number
  pending: number
  available: number
}

export function readLeaveBalance(value: unknown): BackendLeaveBalance | null {
  if (!isRecord(value) || !isNonEmptyString(value.employeeId) || !Array.isArray(value.items)) return null
  const items = value.items.filter(
    (item): item is BackendLeaveBalance['items'][number] =>
      isRecord(item) &&
      isNonEmptyString(item.leaveTypeId) &&
      isFiniteNumber(item.year) &&
      isFiniteNumber(item.totalAllocated) &&
      isFiniteNumber(item.usedLeaves) &&
      isFiniteNumber(item.pendingLeaves) &&
      isFiniteNumber(item.availableLeaves),
  )
  return {
    employeeId: value.employeeId,
    employeeName: typeof value.employeeName === 'string' ? value.employeeName : '',
    items,
  }
}

export function mapLeaveBalanceRows(balance: BackendLeaveBalance, types: LeaveTypeOption[]): LeaveBalanceRow[] {
  const byId = new Map(types.map((type) => [type.id, type]))
  return balance.items.map((item) => {
    const type = byId.get(item.leaveTypeId)
    return {
      leaveTypeId: item.leaveTypeId,
      leaveTypeCode: type?.code ?? item.leaveTypeId,
      leaveTypeName: type?.name ?? item.leaveTypeName,
      year: item.year,
      allocated: item.totalAllocated,
      used: item.usedLeaves,
      pending: item.pendingLeaves,
      available: item.availableLeaves,
    }
  })
}

/** Available paid days per leave type code (pending requests already reserved by the server). */
export function availableByTypeCode(rows: LeaveBalanceRow[]): Record<string, number> {
  return Object.fromEntries(rows.map((row) => [row.leaveTypeCode, row.available]))
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export function readLeaveCalendar(value: unknown): BackendLeaveCalendar | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null
  const items = value.items.filter(
    (item): item is BackendLeaveCalendarItem =>
      isRecord(item) &&
      isNonEmptyString(item.id) &&
      isNonEmptyString(item.employeeId) &&
      isDateOnly(item.startDate) &&
      isDateOnly(item.endDate) &&
      item.startDate <= item.endDate &&
      fromDayPortion(item.dayPortion) !== null,
  )
  const range = isRecord(value.range) && isDateOnly(value.range.startDate) && isDateOnly(value.range.endDate)
    ? { startDate: value.range.startDate, endDate: value.range.endDate }
    : { startDate: '', endDate: '' }
  return { items, range }
}

/**
 * Calendar chips per day from approved server leave. Leave-type chips use
 * the leave type code when the type is known, otherwise its name.
 */
export function buildServerCalendarDays(
  items: BackendLeaveCalendarItem[],
  options: { types: LeaveTypeOption[]; viewerEmployeeId: string | null },
): Map<string, CalendarLeaveDayEntry[]> {
  const byId = new Map(options.types.map((type) => [type.id, type]))
  const map = new Map<string, CalendarLeaveDayEntry[]>()
  for (const item of items) {
    const code = byId.get(item.leaveTypeId)?.code ?? (item.leaveTypeName || item.leaveTypeId)
    const who = item.employeeId === options.viewerEmployeeId ? 'You' : item.employeeName || 'Employee'
    const half = halfDayLabel(fromDayPortion(item.dayPortion) ?? 'full')
    const label = half ? `${who} · ${half}` : who
    for (const date of eachDateInRange(item.startDate, item.endDate)) {
      map.set(date, [...(map.get(date) ?? []), { code, label }])
    }
  }
  return map
}

// ---------------------------------------------------------------------------
// Apply payload
// ---------------------------------------------------------------------------

export const LEAVE_EMPLOYEE_NOT_LINKED =
  "We couldn't retrieve your employee record, so leave cannot be applied right now. Please contact your HR administrator if this continues."

export type ApplyLeaveInput = {
  employeeId: string | null
  leaveTypeCode: string
  fromDate: string
  toDate: string
  reason: string
  portion?: HalfDayPortion
}

export type ApplyLeaveBodyResult = { ok: true; body: ApplyLeaveBody } | { ok: false; error: string }

/** Builds the strict POST /leaves body, mirroring applyLeaveSchema's checks. */
export function buildApplyLeaveBody(input: ApplyLeaveInput, types: LeaveTypeOption[]): ApplyLeaveBodyResult {
  if (!input.employeeId) return { ok: false, error: LEAVE_EMPLOYEE_NOT_LINKED }
  const type = types.find((item) => item.code === input.leaveTypeCode)
  if (!type) return { ok: false, error: 'Choose a leave type that is configured on the server.' }
  if (!type.isActive) return { ok: false, error: `${type.name} is inactive.` }
  if (!isDateOnly(input.fromDate) || !isDateOnly(input.toDate)) {
    return { ok: false, error: 'Select valid from and to dates.' }
  }
  if (input.fromDate > input.toDate) return { ok: false, error: 'End date cannot be before start date.' }
  const dayPortion = toDayPortion(input.portion)
  if (dayPortion !== 'FULL_DAY' && input.fromDate !== input.toDate) {
    return { ok: false, error: 'Half-day leave must start and end on the same date.' }
  }
  const reason = input.reason.trim()
  if (reason.length > 1000) return { ok: false, error: 'Reason must be 1000 characters or fewer.' }

  const body: ApplyLeaveBody = {
    employeeId: input.employeeId,
    leaveTypeId: type.id,
    startDate: input.fromDate,
    endDate: input.toDate,
    dayPortion,
  }
  if (reason) body.reason = reason
  return { ok: true, body }
}

/** Trimmed optional note/reason for review and cancel bodies (server max 1000). */
export function optionalNote(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, 1000) : undefined
}

// ---------------------------------------------------------------------------
// Policy run summaries
// ---------------------------------------------------------------------------

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

export function describeAccrualRun(result: BackendAccrualRunResult): string {
  const skipped = result.skippedManual + result.skippedDuplicate + result.skippedIneligible
  const period = result.periodKey ? ` for ${result.periodKey}` : ''
  return `Accrual run${period}: ${plural(result.accruedCount, 'credit')} posted across ${plural(result.processedEmployees, 'employee')}, ${skipped} skipped.`
}

export function describeCarryForwardRun(result: BackendCarryForwardRunResult): string {
  const skipped = result.skippedDisabled + result.skippedDuplicate
  return `Carry-forward ${result.fromYear} → ${result.toYear}: ${plural(result.carriedCount, 'balance')} carried of ${result.processedBalances} processed, ${skipped} skipped.`
}

export function describeCarryForwardExpiry(year: number, result: BackendCarryForwardExpiryResult): string {
  return `Carry-forward expiry for ${year}: ${plural(result.expiredCount, 'balance')} expired, ${result.skippedDuplicate} already processed.`
}

// ---------------------------------------------------------------------------
// Balance adjustment payload (adjustLeaveBalanceSchema, strict)
// ---------------------------------------------------------------------------

export type AdjustmentInput = {
  employeeId: string
  leaveTypeId: string
  year: number
  /** Raw field value; positive adds days, negative removes them. */
  amount: string
  reason: string
}

export type AdjustmentBodyResult = { ok: true; body: AdjustLeaveBalanceBody } | { ok: false; error: string }

export function buildAdjustmentBody(input: AdjustmentInput): AdjustmentBodyResult {
  if (!input.employeeId.trim()) return { ok: false, error: 'Select an employee.' }
  if (!input.leaveTypeId.trim()) return { ok: false, error: 'Select a leave type.' }
  if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) {
    return { ok: false, error: 'Year must be between 2000 and 2100.' }
  }
  const amount = input.amount.trim() === '' ? Number.NaN : Number(input.amount)
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: 'Enter a non-zero number of days (negative to deduct).' }
  }
  const reason = input.reason.trim()
  if (!reason) return { ok: false, error: 'A reason is required.' }
  if (reason.length > 1000) return { ok: false, error: 'Reason must be 1000 characters or fewer.' }
  return {
    ok: true,
    body: { employeeId: input.employeeId, leaveTypeId: input.leaveTypeId, year: input.year, amount, reason },
  }
}
