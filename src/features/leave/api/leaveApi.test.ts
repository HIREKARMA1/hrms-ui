/**
 * Stage 4.7: Leave Management API integration.
 *
 * Mock-based only: every request goes to a stubbed `fetch` and fixtures mirror
 * the hrms-server source (leaves / leave-types / leave-policies /
 * leave-encashments / employee-leave-policies mappers and zod schemas).
 * Nothing here talks to a real backend.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi } from '@/services/api/baseApi'

import type { BackendEncashment, BackendLeaveRequest, BackendLeaveType } from './leaveApi.types'
import {
  availableByTypeCode,
  buildAdjustmentBody,
  buildApplyLeaveBody,
  buildServerCalendarDays,
  buildServerLeaveSettings,
  describeAccrualRun,
  describeCarryForwardExpiry,
  describeCarryForwardRun,
  eachDateInRange,
  fromDayPortion,
  halfDayLabel,
  isDateOnly,
  LEAVE_EMPLOYEE_NOT_LINKED,
  leaveEmployeeFromDirectory,
  leaveEmployeeFromEmbed,
  mapEncashment,
  mapLeaveBalanceRows,
  mapLeaveRequest,
  mapLeaveType,
  mergeLeaveEmployees,
  readEnvelopeData,
  readLeaveBalance,
  readLeaveCalendar,
  readPage,
  requestPortion,
  toBackendLeaveStatus,
  toDateOnly,
  toDayPortion,
  toUiEncashmentStatus,
  toUiLeaveStatus,
  type LeaveTypeOption,
} from './leaveMappers'
import { getLeaveErrorMessage, isMultiLevelWorkflowError, LEAVE_INVALID_RESPONSE, LEAVE_MAX_LIMIT, leaveApi } from './leaveApi'

// ---------------------------------------------------------------------------
// Fixtures (shapes from the hrms-server mappers)
// ---------------------------------------------------------------------------

function backendLeave(overrides: Partial<BackendLeaveRequest> = {}): BackendLeaveRequest {
  return {
    id: 'lv-1',
    employeeId: 'emp-1',
    leaveTypeId: 'lt-cl',
    startDate: '2026-11-23',
    endDate: '2026-11-24',
    dayPortion: 'FULL_DAY',
    totalDays: 2,
    reason: 'Family event',
    status: 'PENDING',
    appliedByUserId: 'user-hr',
    reviewedByUserId: null,
    reviewedAt: null,
    reviewNote: null,
    cancelledAt: null,
    cancelReason: null,
    paidDays: 2,
    lopDays: 0,
    workflowId: null,
    currentLevel: null,
    createdAt: '2026-11-20T05:00:00.000Z',
    updatedAt: '2026-11-20T05:00:00.000Z',
    leaveType: { id: 'lt-cl', code: 'CL', name: 'Casual Leave', isPaid: true },
    employee: { id: 'emp-1', employeeCode: 'EMP001', firstName: 'Asha', lastName: 'Rao', email: 'asha@example.test' },
    ...overrides,
  }
}

function backendLeaveType(overrides: Partial<BackendLeaveType> = {}): BackendLeaveType {
  return {
    id: 'lt-cl',
    code: 'CL',
    name: 'Casual Leave',
    description: null,
    isPaid: true,
    isActive: true,
    requiresApproval: true,
    maxAllowedDays: 12,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    requestCount: 3,
    balanceCount: 10,
    ...overrides,
  }
}

function backendEncashment(overrides: Partial<BackendEncashment> = {}): BackendEncashment {
  return {
    id: 'enc-1',
    employeeId: 'emp-1',
    leaveTypeId: 'lt-el',
    policyId: 'pol-1',
    year: 2026,
    days: 5,
    ratePerDay: 1000,
    amount: 5000,
    currency: 'INR',
    reason: null,
    status: 'PENDING',
    appliedByUserId: 'user-emp',
    reviewedByUserId: null,
    reviewedAt: null,
    reviewNote: null,
    cancelledAt: null,
    cancelReason: null,
    balanceDeducted: false,
    createdAt: '2026-11-18T08:00:00.000Z',
    updatedAt: '2026-11-18T08:00:00.000Z',
    leaveType: { id: 'lt-el', code: 'EL', name: 'Earned Leave' },
    employee: { id: 'emp-1', employeeCode: 'EMP001', firstName: 'Asha', lastName: 'Rao' },
    ...overrides,
  } as BackendEncashment
}

const TYPES: LeaveTypeOption[] = [
  mapLeaveType(backendLeaveType())!,
  mapLeaveType(backendLeaveType({ id: 'lt-sl', code: 'SL', name: 'Sick Leave' }))!,
  mapLeaveType(backendLeaveType({ id: 'lt-old', code: 'OLD', name: 'Retired type', isActive: false }))!,
]

const pagination = (total: number) => ({ page: 1, limit: LEAVE_MAX_LIMIT, total, totalPages: Math.ceil(total / LEAVE_MAX_LIMIT) })
const envelope = (data: unknown) => ({ success: true, message: 'ok', data })

function makeStore(accessToken: string | null = 'access-1') {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: { accessToken, refreshToken: accessToken ? 'refresh-1' : null, user: null, rememberMe: false },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function stubFetch(handler: (request: Request) => Response | Promise<Response>) {
  const calls: Request[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      calls.push(request.clone())
      return handler(request)
    }),
  )
  return calls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Dates, statuses and half days
// ---------------------------------------------------------------------------

describe('date conversion', () => {
  it('accepts only real YYYY-MM-DD dates', () => {
    expect(isDateOnly('2026-11-20')).toBe(true)
    expect(isDateOnly('2026-02-30')).toBe(false)
    expect(isDateOnly('2026-11-20T00:00:00.000Z')).toBe(false)
    expect(isDateOnly(20261120)).toBe(false)
  })

  it('keeps date-only strings and takes the UTC day of ISO timestamps', () => {
    expect(toDateOnly('2026-11-23')).toBe('2026-11-23')
    expect(toDateOnly('2026-11-20T23:30:00.000Z')).toBe('2026-11-20')
    expect(toDateOnly('2026-11-20T23:30:00.000-05:00')).toBe('2026-11-21')
    expect(toDateOnly('20/11/2026')).toBeNull()
    expect(toDateOnly('2026-13-01T00:00:00Z')).toBeNull()
    expect(toDateOnly(null)).toBeNull()
  })

  it('expands inclusive ranges across month ends', () => {
    expect(eachDateInRange('2026-11-29', '2026-12-02')).toEqual(['2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02'])
    expect(eachDateInRange('2026-11-23', '2026-11-23')).toEqual(['2026-11-23'])
    expect(eachDateInRange('2026-11-24', '2026-11-23')).toEqual([])
  })
})

describe('status conversion', () => {
  it('maps every backend leave status both ways', () => {
    for (const status of ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const) {
      const ui = toUiLeaveStatus(status)
      expect(ui).not.toBeNull()
      expect(toBackendLeaveStatus(ui!)).toBe(status)
    }
    expect(toUiLeaveStatus('ESCALATED')).toBeNull()
  })

  it('maps encashment statuses without inventing payout states', () => {
    expect(toUiEncashmentStatus('PENDING')).toBe('Pending approval')
    expect(toUiEncashmentStatus('APPROVED')).toBe('Approved')
    expect(toUiEncashmentStatus('REJECTED')).toBe('Rejected')
    expect(toUiEncashmentStatus('CANCELLED')).toBe('Cancelled')
    expect(toUiEncashmentStatus('PAID')).toBeNull()
  })
})

describe('half-day mapping', () => {
  it('converts portions to dayPortion and back', () => {
    expect(toDayPortion(undefined)).toBe('FULL_DAY')
    expect(toDayPortion('full')).toBe('FULL_DAY')
    expect(toDayPortion('first_half')).toBe('FIRST_HALF')
    expect(toDayPortion('second_half')).toBe('SECOND_HALF')
    expect(fromDayPortion('FIRST_HALF')).toBe('first_half')
    expect(fromDayPortion('HALF')).toBeNull()
    expect(halfDayLabel('second_half')).toBe('Second half')
    expect(halfDayLabel('full')).toBeNull()
  })

  it('maps a half-day request to a single half segment', () => {
    const request = mapLeaveRequest(backendLeave({ startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'SECOND_HALF', totalDays: 0.5 }))!
    expect(request.days).toBe(0.5)
    expect(request.segments).toEqual([{ date: '2026-11-23', portion: 'second_half', countsAsLeave: true }])
    expect(requestPortion(request)).toBe('second_half')
  })
})

// ---------------------------------------------------------------------------
// Response mapping
// ---------------------------------------------------------------------------

describe('leave request mapping', () => {
  it('maps a pending single-level request into the HR queue', () => {
    const request = mapLeaveRequest(backendLeave())!
    expect(request).toMatchObject({
      id: 'lv-1',
      employeeId: 'emp-1',
      leaveTypeCode: 'CL',
      fromDate: '2026-11-23',
      toDate: '2026-11-24',
      days: 2,
      reason: 'Family event',
      appliedOn: '2026-11-20',
      status: 'Pending',
      currentLevel: 'HR',
      currentStepLabel: 'Pending: HR',
    })
    expect(request.segments).toHaveLength(2)
    expect(request.multiLevelWorkflow).toBeUndefined()
    expect(request.steps[0]).toMatchObject({ kind: 'applied', actorId: 'user-hr', actorName: '' })
  })

  it('flags workflow requests and keeps them out of the HR step', () => {
    const request = mapLeaveRequest(backendLeave({ workflowId: 'wf-1', currentLevel: 2 }))!
    expect(request.multiLevelWorkflow).toBe(true)
    expect(request.currentLevel).toBeNull()
    expect(request.currentStepLabel).toBe('Pending: level 2')
  })

  it('records loss-of-pay days and review steps', () => {
    const request = mapLeaveRequest(
      backendLeave({ status: 'APPROVED', lopDays: 1, paidDays: 1, reviewedAt: '2026-11-21T10:00:00.000Z', reviewedByUserId: 'user-mgr', reviewNote: 'OK' }),
    )!
    expect(request.lwpDays).toBe(1)
    expect(request.convertedToLwp).toBe(true)
    expect(request.currentStepLabel).toBe('Approved')
    expect(request.steps[1]).toMatchObject({ kind: 'approval', at: '2026-11-21', actorId: 'user-mgr', comment: 'OK' })
  })

  it('records cancellation with its reason', () => {
    const request = mapLeaveRequest(backendLeave({ status: 'CANCELLED', cancelledAt: '2026-11-22T00:00:00.000Z', cancelReason: 'Plans changed' }))!
    expect(request.status).toBe('Cancelled')
    expect(request.steps[1]).toMatchObject({ kind: 'cancellation', at: '2026-11-22', comment: 'Plans changed' })
  })

  it('falls back to the type id when the leave type block is missing', () => {
    expect(mapLeaveRequest(backendLeave({ leaveType: null }))!.leaveTypeCode).toBe('lt-cl')
  })

  it('rejects invalid records', () => {
    expect(mapLeaveRequest(backendLeave({ status: 'UNKNOWN' as never }))).toBeNull()
    expect(mapLeaveRequest(backendLeave({ startDate: '2026-11-25', endDate: '2026-11-24' }))).toBeNull()
    expect(mapLeaveRequest(backendLeave({ dayPortion: 'HALF' as never }))).toBeNull()
    expect(mapLeaveRequest(backendLeave({ totalDays: '2' as never }))).toBeNull()
    expect(mapLeaveRequest({ ...backendLeave(), id: '' })).toBeNull()
    expect(mapLeaveRequest(null)).toBeNull()
  })

  it('reads envelopes and pages strictly, dropping invalid items', () => {
    expect(readEnvelopeData({ success: true, data: { a: 1 } })).toEqual({ a: 1 })
    expect(readEnvelopeData({ success: false, data: {} })).toBeUndefined()
    expect(readEnvelopeData({ data: {} })).toBeUndefined()
    const page = readPage({ items: [backendLeave(), { id: 'broken' }], pagination: pagination(2) }, mapLeaveRequest)!
    expect(page.items.map((item) => item.id)).toEqual(['lv-1'])
    expect(page.pagination.total).toBe(2)
    expect(readPage({ items: [] }, mapLeaveRequest)).toBeNull()
    expect(readPage({ pagination: pagination(0) }, mapLeaveRequest)).toBeNull()
  })
})

describe('employees, encashments, types, balances and calendar mapping', () => {
  it('builds neutral employees from embeds and lets directory records win', () => {
    const embedded = leaveEmployeeFromEmbed({ id: 'emp-1', firstName: 'Asha', lastName: 'Rao' })!
    expect(embedded).toMatchObject({ id: 'emp-1', name: 'Asha Rao', department: '', joiningDate: '', employmentStatus: 'ACTIVE' })
    expect(leaveEmployeeFromEmbed(null)).toBeNull()
    const directory = leaveEmployeeFromDirectory({
      server: { id: 'emp-1' },
      profile: { firstName: 'Asha', lastName: 'Rao', department: 'Engineering', designation: 'Engineer', dateOfJoining: '2024-01-15', employmentStatus: 'Probation' },
    })
    expect(directory).toMatchObject({ department: 'Engineering', joiningDate: '2024-01-15', employmentStatus: 'PROBATION' })
    const merged = mergeLeaveEmployees([embedded], [directory])
    expect(merged).toHaveLength(1)
    expect(merged[0].department).toBe('Engineering')
  })

  it('maps encashments with amount and approval date', () => {
    const approved = mapEncashment(backendEncashment({ status: 'APPROVED', reviewedAt: '2026-11-19T09:00:00.000Z' }))!
    expect(approved).toMatchObject({ id: 'enc-1', leaveTypeCode: 'EL', days: 5, status: 'Approved', approvedOn: '2026-11-19', amount: 5000, currency: 'INR' })
    expect(mapEncashment(backendEncashment({ status: 'PAID' as never }))).toBeNull()
  })

  it('maps leave types into neutral policies and server settings', () => {
    expect(TYPES[0]).toMatchObject({ id: 'lt-cl', code: 'CL', isPaid: true, isActive: true, maxAllowedDays: 12 })
    expect(mapLeaveType({ id: 'x', code: 'X' })).toBeNull()
    const settings = buildServerLeaveSettings(TYPES)
    expect(settings.holidays).toEqual([])
    expect(settings.leaveTypes.map((policy) => [policy.code, policy.enabled])).toEqual([
      ['CL', true],
      ['SL', true],
      ['OLD', false],
    ])
    expect(settings.leaveTypes[0]).toMatchObject({ dayCounting: 'calendar', minNoticeDays: 0, allowLwpConversion: true, halfDayAllowed: true })
  })

  it('maps balances by leave type id to codes', () => {
    const balance = readLeaveBalance({
      employeeId: 'emp-1',
      employeeName: 'Asha Rao',
      items: [
        { employeeId: 'emp-1', employeeName: 'Asha Rao', leaveTypeId: 'lt-cl', leaveTypeName: 'Casual Leave', year: 2026, totalAllocated: 12, usedLeaves: 3, pendingLeaves: 2, availableLeaves: 7 },
        { leaveTypeId: 'lt-x', year: 2026, totalAllocated: 'bad' },
      ],
    })!
    const rows = mapLeaveBalanceRows(balance, TYPES)
    expect(rows).toEqual([
      { leaveTypeId: 'lt-cl', leaveTypeCode: 'CL', leaveTypeName: 'Casual Leave', year: 2026, allocated: 12, used: 3, pending: 2, available: 7 },
    ])
    expect(availableByTypeCode(rows)).toEqual({ CL: 7 })
    expect(readLeaveBalance({ items: [] })).toBeNull()
  })

  it('builds calendar chips per day, labelling the viewer and half days', () => {
    const calendar = readLeaveCalendar({
      items: [
        { id: 'lv-1', employeeId: 'emp-1', employeeName: 'Asha Rao', leaveTypeId: 'lt-cl', leaveTypeName: 'Casual Leave', startDate: '2026-11-23', endDate: '2026-11-24', dayPortion: 'FULL_DAY', totalDays: 2, status: 'APPROVED' },
        { id: 'lv-2', employeeId: 'emp-2', employeeName: 'Ravi K', leaveTypeId: 'lt-new', leaveTypeName: 'Wellness', startDate: '2026-11-24', endDate: '2026-11-24', dayPortion: 'FIRST_HALF', totalDays: 0.5, status: 'APPROVED' },
        { id: 'bad', employeeId: 'emp-3', startDate: '2026-11-25', endDate: '2026-11-24', dayPortion: 'FULL_DAY' },
      ],
      range: { startDate: '2026-11-01', endDate: '2026-11-30' },
    })!
    expect(calendar.items).toHaveLength(2)
    expect(calendar.range).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30' })
    const days = buildServerCalendarDays(calendar.items, { types: TYPES, viewerEmployeeId: 'emp-1' })
    expect(days.get('2026-11-23')).toEqual([{ code: 'CL', label: 'You' }])
    expect(days.get('2026-11-24')).toEqual([
      { code: 'CL', label: 'You' },
      { code: 'Wellness', label: 'Ravi K · First half' },
    ])
  })

  it('summarises policy run counters', () => {
    expect(describeAccrualRun({ processedEmployees: 4, accruedCount: 3, skippedManual: 0, skippedDuplicate: 1, skippedIneligible: 0, periodKey: '2026-11' })).toBe(
      'Accrual run for 2026-11: 3 credits posted across 4 employees, 1 skipped.',
    )
    expect(describeCarryForwardRun({ processedBalances: 2, carriedCount: 1, skippedDisabled: 1, skippedDuplicate: 0, fromYear: 2025, toYear: 2026 })).toBe(
      'Carry-forward 2025 → 2026: 1 balance carried of 2 processed, 1 skipped.',
    )
    expect(describeCarryForwardExpiry(2026, { expiredCount: 0, skippedDuplicate: 2 })).toBe('Carry-forward expiry for 2026: 0 balances expired, 2 already processed.')
  })
})

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

describe('apply payload', () => {
  const base = { employeeId: 'emp-1', leaveTypeCode: 'CL', fromDate: '2026-11-23', toDate: '2026-11-24', reason: '  Family event  ' }

  it('builds the strict POST /leaves body with the type id and trimmed reason', () => {
    expect(buildApplyLeaveBody(base, TYPES)).toEqual({
      ok: true,
      body: { employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-24', dayPortion: 'FULL_DAY', reason: 'Family event' },
    })
  })

  it('omits an empty reason and maps half days on a single date', () => {
    const result = buildApplyLeaveBody({ ...base, toDate: '2026-11-23', reason: '  ', portion: 'first_half' }, TYPES)
    expect(result).toEqual({
      ok: true,
      body: { employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'FIRST_HALF' },
    })
  })

  it('refuses to build a body without a linked employee', () => {
    expect(buildApplyLeaveBody({ ...base, employeeId: null }, TYPES)).toEqual({ ok: false, error: LEAVE_EMPLOYEE_NOT_LINKED })
  })

  it('rejects unknown or inactive types, bad dates, multi-day half days and long reasons', () => {
    expect(buildApplyLeaveBody({ ...base, leaveTypeCode: 'XX' }, TYPES).ok).toBe(false)
    expect(buildApplyLeaveBody({ ...base, leaveTypeCode: 'OLD' }, TYPES)).toEqual({ ok: false, error: 'Retired type is inactive.' })
    expect(buildApplyLeaveBody({ ...base, fromDate: '2026-02-30' }, TYPES)).toEqual({ ok: false, error: 'Select valid from and to dates.' })
    expect(buildApplyLeaveBody({ ...base, fromDate: '2026-11-25' }, TYPES)).toEqual({ ok: false, error: 'End date cannot be before start date.' })
    expect(buildApplyLeaveBody({ ...base, portion: 'second_half' }, TYPES)).toEqual({ ok: false, error: 'Half-day leave must start and end on the same date.' })
    expect(buildApplyLeaveBody({ ...base, reason: 'x'.repeat(1001) }, TYPES)).toEqual({ ok: false, error: 'Reason must be 1000 characters or fewer.' })
  })
})

describe('balance adjustment payload', () => {
  const base = { employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: '-1.5', reason: ' Correction ' }

  it('builds a numeric, trimmed body', () => {
    expect(buildAdjustmentBody(base)).toEqual({ ok: true, body: { employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: -1.5, reason: 'Correction' } })
  })

  it('mirrors adjustLeaveBalanceSchema', () => {
    expect(buildAdjustmentBody({ ...base, amount: '0' }).ok).toBe(false)
    expect(buildAdjustmentBody({ ...base, amount: '' }).ok).toBe(false)
    expect(buildAdjustmentBody({ ...base, amount: 'abc' }).ok).toBe(false)
    expect(buildAdjustmentBody({ ...base, year: 1999 }).ok).toBe(false)
    expect(buildAdjustmentBody({ ...base, reason: '  ' })).toEqual({ ok: false, error: 'A reason is required.' })
    expect(buildAdjustmentBody({ ...base, reason: 'x'.repeat(1001) }).ok).toBe(false)
    expect(buildAdjustmentBody({ ...base, leaveTypeId: '' }).ok).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Endpoints (mocked fetch)
// ---------------------------------------------------------------------------

describe('leave endpoints', () => {
  it('lists leaves with a clamped limit and collects embedded employees', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope({ items: [backendLeave()], pagination: pagination(140) })))
    const page = await makeStore().dispatch(leaveApi.endpoints.listLeaves.initiate({ page: 0, limit: 500 })).unwrap()
    const url = new URL(calls[0].url)
    expect(url.pathname.endsWith('/leaves')).toBe(true)
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('limit')).toBe(String(LEAVE_MAX_LIMIT))
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-1')
    expect(page.items[0].leaveTypeCode).toBe('CL')
    expect(page.pagination.total).toBe(140)
    expect(page.employees).toEqual([expect.objectContaining({ id: 'emp-1', name: 'Asha Rao' })])
  })

  it('turns an unexpected body into LEAVE_INVALID_RESPONSE instead of data', async () => {
    stubFetch(() => jsonResponse(200, { items: [] }))
    const result = await makeStore().dispatch(leaveApi.endpoints.listLeaves.initiate({}))
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual({ status: 'CUSTOM_ERROR', error: LEAVE_INVALID_RESPONSE })
    expect(getLeaveErrorMessage(result.error, 'x')).toBe('The server returned an unexpected leave response. Please try again.')
  })

  it('surfaces backend 403 messages', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Missing leaves:approve or leaves:create_on_behalf for team calendar' }))
    const result = await makeStore().dispatch(leaveApi.endpoints.getTeamLeaveCalendar.initiate({ year: 2026, month: 11 }))
    expect((result.error as { status: number }).status).toBe(403)
    expect(getLeaveErrorMessage(result.error, 'fallback')).toContain('team calendar')
  })

  it('reports network failures with the fallback message', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const result = await makeStore().dispatch(leaveApi.endpoints.listLeaveTypes.initiate({}))
    expect(result.error).toBeDefined()
    expect(getLeaveErrorMessage(result.error, 'Could not load leave data.')).toEqual(expect.any(String))
  })

  it('recognises the multi-level workflow 409', () => {
    const error = {
      status: 409,
      data: { message: 'This leave request uses a multi-level approval workflow. Use POST /api/v1/leave-approval/:leaveRequestId/approve or /reject' },
    }
    expect(isMultiLevelWorkflowError(error)).toBe(true)
    expect(isMultiLevelWorkflowError({ status: 409, data: { message: 'Overlapping leave request' } })).toBe(false)
    expect(getLeaveErrorMessage(error, 'x')).toContain('multi-level approval workflow')
  })

  it('reads balance, calendar and history with the right paths and params', async () => {
    const calls = stubFetch((request) => {
      const path = new URL(request.url).pathname
      if (path.includes('/leaves/balance/')) return jsonResponse(200, envelope({ employeeId: 'emp-1', employeeName: 'Asha Rao', items: [] }))
      if (path.endsWith('/leaves/calendar')) return jsonResponse(200, envelope({ items: [], range: { startDate: '2026-11-01', endDate: '2026-11-30' } }))
      return jsonResponse(200, envelope({ items: [{ ...backendLeave(), reviewer: null }], pagination: pagination(1) }))
    })
    const store = makeStore()
    await store.dispatch(leaveApi.endpoints.getLeaveBalance.initiate({ employeeId: 'emp/1', year: 2026 })).unwrap()
    await store.dispatch(leaveApi.endpoints.getLeaveCalendar.initiate({ year: 2026, month: 11 })).unwrap()
    const history = await store.dispatch(leaveApi.endpoints.getLeaveHistory.initiate({ employeeId: 'emp-1' })).unwrap()
    const [balance, calendar, historyCall] = calls.map((call) => new URL(call.url))
    expect(balance.pathname.endsWith('/leaves/balance/emp%2F1')).toBe(true)
    expect(balance.searchParams.get('year')).toBe('2026')
    expect(calendar.searchParams.get('year')).toBe('2026')
    expect(calendar.searchParams.get('month')).toBe('11')
    expect(historyCall.pathname.endsWith('/leaves/history/emp-1')).toBe(true)
    expect(history.items[0].id).toBe('lv-1')
  })

  it('posts apply, review and cancel bodies to the documented endpoints', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(backendLeave())))
    const store = makeStore()
    await store
      .dispatch(leaveApi.endpoints.applyLeave.initiate({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'FIRST_HALF' }))
      .unwrap()
    await store.dispatch(leaveApi.endpoints.approveLeave.initiate({ id: 'lv-1', note: '  ok  ' })).unwrap()
    await store.dispatch(leaveApi.endpoints.rejectLeave.initiate({ id: 'lv-1' })).unwrap()
    await store.dispatch(leaveApi.endpoints.cancelLeave.initiate({ id: 'lv-1', reason: 'Plans changed' })).unwrap()

    const sent = await Promise.all(calls.map(async (call) => ({ method: call.method, path: new URL(call.url).pathname, body: await call.text() })))
    expect(sent.map((call) => `${call.method} ${call.path.replace(/^.*\/leaves/, '/leaves')}`)).toEqual([
      'POST /leaves',
      'POST /leaves/lv-1/approve',
      'POST /leaves/lv-1/reject',
      'POST /leaves/lv-1/cancel',
    ])
    expect(JSON.parse(sent[0].body)).toEqual({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'FIRST_HALF' })
    expect(JSON.parse(sent[1].body)).toEqual({ note: 'ok' })
    expect(JSON.parse(sent[2].body)).toEqual({})
    expect(JSON.parse(sent[3].body)).toEqual({ reason: 'Plans changed' })
  })

  it('posts balance adjustments and policy runs', async () => {
    const calls = stubFetch((request) => {
      const path = new URL(request.url).pathname
      if (path.endsWith('/adjustments')) {
        return jsonResponse(201, envelope({ id: 'adj-1', employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: 2, reason: 'Bonus', entitledDays: 14 }))
      }
      if (path.endsWith('/accrual/run')) {
        return jsonResponse(200, envelope({ processedEmployees: 1, accruedCount: 1, skippedManual: 0, skippedDuplicate: 0, skippedIneligible: 0, periodKey: '2026-11' }))
      }
      return jsonResponse(200, envelope({ processedBalances: 0, carriedCount: 0, skippedDisabled: 0, skippedDuplicate: 0, fromYear: 2025, toYear: 2026 }))
    })
    const store = makeStore()
    const saved = await store
      .dispatch(leaveApi.endpoints.adjustLeaveBalance.initiate({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: 2, reason: 'Bonus' }))
      .unwrap()
    expect(saved.entitledDays).toBe(14)
    await store.dispatch(leaveApi.endpoints.runAccrual.initiate({ asOfDate: '2026-11-20' })).unwrap()
    await store.dispatch(leaveApi.endpoints.runCarryForward.initiate({ fromYear: 2025 })).unwrap()
    const paths = calls.map((call) => new URL(call.url).pathname)
    expect(paths[0].endsWith('/employee-leave-policies/adjustments')).toBe(true)
    expect(paths[1].endsWith('/leave-policies/accrual/run')).toBe(true)
    expect(paths[2].endsWith('/leave-policies/carry-forward/run')).toBe(true)
    expect(JSON.parse(await calls[1].text())).toEqual({ asOfDate: '2026-11-20' })
    expect(JSON.parse(await calls[2].text())).toEqual({ fromYear: 2025 })
  })

  it('rejects run results with missing counters', async () => {
    stubFetch(() => jsonResponse(200, envelope({ processedEmployees: 1 })))
    const result = await makeStore().dispatch(leaveApi.endpoints.runAccrual.initiate({}))
    expect(result.error).toEqual({ status: 'CUSTOM_ERROR', error: LEAVE_INVALID_RESPONSE })
  })

  it('lists encashments and policy defaults (bare array data)', async () => {
    stubFetch((request) => {
      const path = new URL(request.url).pathname
      if (path.endsWith('/defaults')) {
        return jsonResponse(200, envelope([
          { id: 'd1', leaveTypeId: 'lt-cl', leaveTypeCode: 'CL', leaveTypeName: 'Casual Leave', annualEntitlement: 12, monthlyAccrualAmount: 1, grantMode: 'MONTHLY_ACCRUAL', isActive: true },
          { id: 'broken' },
        ]))
      }
      return jsonResponse(200, envelope({ items: [backendEncashment()], pagination: pagination(1) }))
    })
    const store = makeStore()
    const encashments = await store.dispatch(leaveApi.endpoints.listEncashments.initiate({})).unwrap()
    expect(encashments.items[0]).toMatchObject({ status: 'Pending approval', amount: 5000 })
    expect(encashments.employees[0].name).toBe('Asha Rao')
    const defaults = await store.dispatch(leaveApi.endpoints.listLeavePolicyDefaults.initiate()).unwrap()
    expect(defaults.map((item) => item.id)).toEqual(['d1'])
  })
})
