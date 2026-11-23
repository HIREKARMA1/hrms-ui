/**
 * Stage 4.7: leave access rules, loading states, server actions and
 * server-mode screens. Requests go to a stubbed `fetch`; screens render with
 * react-dom/server. Nothing here talks to a real backend.
 */
import { configureStore } from '@reduxjs/toolkit'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { RbacContext } from '@/features/rbac/context/rbacContext'
import { canAccessFeature, FEATURE_PERMISSION_MAP } from '@/features/rbac/services/permissionAdapter'
import type { FeatureAccessKey } from '@/features/rbac/types/features'
import type { AuthSession } from '@/features/rbac/types/roles'
import { baseApi } from '@/services/api/baseApi'

import { leaveApi, MULTI_LEVEL_WORKFLOW_MESSAGE } from '../api/leaveApi'
import { EMPLOYEE_RECORD_UNAVAILABLE_MESSAGE } from '../constants/employeeRecordMessages'
import { resolveLeaveViewer } from '../utils/resolveLeaveViewer'
import { buildApplyLeaveBody, buildServerLeaveSettings, LEAVE_EMPLOYEE_NOT_LINKED, leaveEmployeeFromEmbed, mapLeaveRequest, mapLeaveType, type LeaveTypeOption } from '../api/leaveMappers'
import { ApiAccrualPoliciesCard } from '../components/accruals/ApiPolicyTables'
import { ApiBalancesTab } from '../components/balances/ApiBalancesTab'
import { CalendarTab } from '../components/calendar/CalendarTab'
import { HrRequestsTab } from '../components/hrRequests/HrRequestsTab'
import { MyLeaveTab } from '../components/myLeave/MyLeaveTab'
import { ApiLeaveSettingsTab } from '../components/settings/ApiLeaveSettingsTab'
import { LeaveContext } from '../context/leaveContext'
import { LeaveToastContext } from '../context/leaveToastContext'
import { buildApiLeaveSnapshot, resolveLeaveApiAccess, type LeaveApiAccess } from '../services/leaveApiSnapshot'
import type { LeaveSnapshot } from '../services/leaveService'
import type { LeaveViewer } from '../types/viewer'
import { monthMatrix } from '../utils/calendarMonthMatrix'
import { validateLeaveRequest } from '../utils/validateLeaveRequest'
import { combineLeaveQueries } from './useLeaveApiSnapshot'
import { useLeaveApiActions } from './useLeaveApiActions'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPES: LeaveTypeOption[] = [
  mapLeaveType({ id: 'lt-cl', code: 'CL', name: 'Casual Leave', description: null, isPaid: true, isActive: true, requiresApproval: true, maxAllowedDays: 12, requestCount: 3, balanceCount: 1 })!,
  mapLeaveType({ id: 'lt-sl', code: 'SL', name: 'Sick Leave', description: 'Illness', isPaid: true, isActive: true, requiresApproval: true, maxAllowedDays: null, requestCount: 0, balanceCount: 0 })!,
]

const pagination = (total: number) => ({ page: 1, limit: 100, total, totalPages: 1 })
const envelope = (data: unknown) => ({ success: true, message: 'ok', data })

function backendLeave(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lv-1',
    employeeId: 'emp-1',
    leaveTypeId: 'lt-cl',
    startDate: '2030-01-07',
    endDate: '2030-01-08',
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

function makeStore() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: { auth: { accessToken: 'access-1', refreshToken: 'refresh-1', user: null, rememberMe: false } },
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

function permissionsFor(features: FeatureAccessKey[]): string[] {
  return features.map((feature) => FEATURE_PERMISSION_MAP[feature]).filter((code): code is NonNullable<typeof code> => Boolean(code))
}

function canAccessWith(features: FeatureAccessKey[]) {
  const permissions = permissionsFor(features)
  return (feature: FeatureAccessKey) => canAccessFeature(feature, 'HR_ADMIN', permissions as never)
}

const HR_VIEWER: LeaveViewer = {
  role: 'HR_ADMIN',
  employeeId: null,
  actorId: 'user-hr',
  displayName: 'Hema HR',
  email: 'hr@example.test',
  source: 'authenticated',
}

function render(node: ReactNode, options: { features?: FeatureAccessKey[]; snapshot?: LeaveSnapshot | null; store?: ReturnType<typeof makeStore> } = {}) {
  const store = options.store ?? makeStore()
  const session = { userId: 'user-hr', displayName: 'Hema HR', email: 'hr@example.test', roleCode: 'HR_ADMIN', roleName: 'HR Admin', permissions: permissionsFor(options.features ?? []) } as unknown as AuthSession
  const withLeave = createElement(LeaveContext.Provider, {
    value: { loading: false, error: null, snapshot: options.snapshot ?? null, reload: async () => {} },
    children: createElement(LeaveToastContext.Provider, { value: { showToast: () => {} }, children: node }),
  })
  return renderToStaticMarkup(
    createElement(Provider, {
      store,
      children: createElement(RbacContext.Provider, {
        value: { session, roleCode: 'HR_ADMIN', navigation: [], routePrefix: '/hr', roleLabel: 'HR Admin' },
        children: withLeave,
      }),
    }),
  )
}

function serverSnapshot(access: Partial<LeaveApiAccess> = {}): LeaveSnapshot {
  const requestItem = mapLeaveRequest(backendLeave())!
  return buildApiLeaveSnapshot({
    access: { requests: true, orgWideRequests: true, leaveTypes: true, encashments: false, employeeDirectory: false, ...access },
    leaveTypes: TYPES,
    requests: { items: [requestItem], pagination: pagination(1), employees: [leaveEmployeeFromEmbed({ id: 'emp-1', firstName: 'Asha', lastName: 'Rao' })!] },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Permissions and missing employee id
// ---------------------------------------------------------------------------

describe('leave API access', () => {
  it('gives HR org-wide reads without an employee link', () => {
    const access = resolveLeaveApiAccess(
      canAccessWith(['leave.requests', 'leave.approve', 'leave.types', 'leave.encashments.view', 'leave.encashments.approve', 'employee.directory']),
      null,
    )
    expect(access).toEqual({ requests: true, orgWideRequests: true, leaveTypes: true, encashments: true, employeeDirectory: true })
  })

  it('treats leaves:create_on_behalf as org-wide too', () => {
    expect(resolveLeaveApiAccess(canAccessWith(['leave.requests', 'leave.createOnBehalf']), null).orgWideRequests).toBe(true)
  })

  it('skips self-scoped lists while the employee id is missing', () => {
    const employee = canAccessWith(['leave.requests', 'leave.encashments.view', 'leave.types'])
    expect(resolveLeaveApiAccess(employee, null)).toEqual({ requests: false, orgWideRequests: false, leaveTypes: true, encashments: false, employeeDirectory: false })
    expect(resolveLeaveApiAccess(employee, 'emp-1')).toMatchObject({ requests: true, orgWideRequests: false, encashments: true })
  })

  it('grants nothing without permissions', () => {
    expect(resolveLeaveApiAccess(canAccessWith([]), 'emp-1')).toEqual({ requests: false, orgWideRequests: false, leaveTypes: false, encashments: false, employeeDirectory: false })
  })

  it('builds a server snapshot with no mock ledger, comp-off or holidays', () => {
    const snapshot = serverSnapshot()
    expect(snapshot.api?.requestTotal).toBe(1)
    expect(snapshot.ledger).toEqual([])
    expect(snapshot.compOffLots).toEqual([])
    expect(snapshot.delegations).toEqual([])
    expect(snapshot.settings.holidays).toEqual([])
    expect(snapshot.employees.map((item) => item.id)).toEqual(['emp-1'])
    expect(snapshot.employees.some((item) => item.id.startsWith('EMP-'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Loading states
// ---------------------------------------------------------------------------

describe('loading states', () => {
  it('waits for active reads and ignores skipped ones', () => {
    expect(combineLeaveQueries([{ active: true, hasData: false, isError: false }, { active: false, hasData: false, isError: false }])).toEqual({ loading: true, error: null })
    expect(combineLeaveQueries([{ active: true, hasData: true, isError: false }, { active: false, hasData: false, isError: false }])).toEqual({ loading: false, error: null })
    expect(combineLeaveQueries([])).toEqual({ loading: false, error: null })
  })

  it('reports the first failed read without data, but keeps stale data on refetch errors', () => {
    const failed = combineLeaveQueries([
      { active: true, hasData: false, isError: false },
      { active: true, hasData: false, isError: true, error: { status: 403, data: { message: 'Forbidden resource' } } },
    ])
    expect(failed).toEqual({ loading: false, error: 'Forbidden resource' })
    expect(combineLeaveQueries([{ active: true, hasData: true, isError: true, error: { status: 500 } }])).toEqual({ loading: false, error: null })
  })

  it('tracks a pending list request until the response arrives', async () => {
    let respond: (response: Response) => void = () => {}
    stubFetch(() => new Promise<Response>((resolve) => (respond = resolve)))
    const store = makeStore()
    const pending = store.dispatch(leaveApi.endpoints.listLeaves.initiate({ page: 1, limit: 100 }))
    await vi.waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled())
    expect(leaveApi.endpoints.listLeaves.select({ page: 1, limit: 100 })(store.getState()).isLoading).toBe(true)
    respond(jsonResponse(200, envelope({ items: [backendLeave()], pagination: pagination(1) })))
    await pending
    const state = leaveApi.endpoints.listLeaves.select({ page: 1, limit: 100 })(store.getState())
    expect(state.isSuccess).toBe(true)
    expect(state.data?.items).toHaveLength(1)
  })

  it('renders in-panel loading for server policy lists and calendars', () => {
    stubFetch(() => new Promise<Response>(() => {}))
    expect(render(createElement(ApiAccrualPoliciesCard))).toContain('Loading accrual policies…')
    const html = render(createElement(CalendarTab, { viewer: HR_VIEWER, scope: 'org' }), {
      features: ['leave.requests', 'leave.createOnBehalf'],
      snapshot: serverSnapshot(),
    })
    expect(html).toContain('Loading leave calendar…')
    expect(html).toContain('Only approved leave is shown.')
  })
})

// ---------------------------------------------------------------------------
// Submission behaviour (useLeaveApiActions)
// ---------------------------------------------------------------------------

function captureActions(store = makeStore()) {
  let actions: ReturnType<typeof useLeaveApiActions> | null = null
  function Capture() {
    actions = useLeaveApiActions()
    return null
  }
  renderToStaticMarkup(createElement(Provider, { store, children: createElement(Capture) }))
  return actions!
}

describe('server leave actions', () => {
  const input = { employeeId: 'emp-1', leaveTypeCode: 'CL', fromDate: '2030-01-07', toDate: '2030-01-07', reason: 'Doctor visit', portion: 'second_half' as const }

  it('never calls the API for an unlinked applicant', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(backendLeave())))
    const result = await captureActions().apply({ ...input, employeeId: null }, TYPES)
    expect(result).toEqual({ ok: false, message: LEAVE_EMPLOYEE_NOT_LINKED })
    expect(calls).toHaveLength(0)
  })

  it('submits POST /leaves with the mapped body', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(backendLeave({ startDate: '2030-01-07', endDate: '2030-01-07', dayPortion: 'SECOND_HALF', totalDays: 0.5 }))))
    const result = await captureActions().apply(input, TYPES)
    expect(result).toEqual({ ok: true })
    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('POST')
    expect(JSON.parse(await calls[0].text())).toEqual({
      employeeId: 'emp-1',
      leaveTypeId: 'lt-cl',
      startDate: '2030-01-07',
      endDate: '2030-01-07',
      dayPortion: 'SECOND_HALF',
      reason: 'Doctor visit',
    })
  })

  it('returns the backend message when the request is rejected', async () => {
    stubFetch(() => jsonResponse(409, { statusCode: 409, message: 'Overlapping leave request exists for this date range' }))
    const result = await captureActions().apply(input, TYPES)
    expect(result).toEqual({ ok: false, message: 'Overlapping leave request exists for this date range' })
  })

  it('blocks approve/reject on multi-level workflow requests without calling the API', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(backendLeave())))
    const workflow = mapLeaveRequest(backendLeave({ workflowId: 'wf-1', currentLevel: 1 }))!
    const actions = captureActions()
    expect(await actions.approve(workflow)).toEqual({ ok: false, message: MULTI_LEVEL_WORKFLOW_MESSAGE })
    expect(await actions.reject(workflow, 'No')).toEqual({ ok: false, message: MULTI_LEVEL_WORKFLOW_MESSAGE })
    expect(calls).toHaveLength(0)
  })

  it('sends the trimmed review note and cancel reason', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(backendLeave({ status: 'REJECTED' }))))
    const actions = captureActions()
    const request = mapLeaveRequest(backendLeave())!
    expect(await actions.reject(request, '  Team offsite  ')).toEqual({ ok: true })
    expect(await actions.cancel('lv-1', 'Duplicate')).toEqual({ ok: true })
    expect(new URL(calls[0].url).pathname.endsWith('/leaves/lv-1/reject')).toBe(true)
    expect(JSON.parse(await calls[0].text())).toEqual({ note: 'Team offsite' })
    expect(JSON.parse(await calls[1].text())).toEqual({ reason: 'Duplicate' })
  })

  it('maps a workflow 409 from the server to the workflow message', async () => {
    stubFetch(() =>
      jsonResponse(409, { statusCode: 409, message: 'This leave request uses a multi-level approval workflow. Use POST /api/v1/leave-approval/:leaveRequestId/approve or /reject' }),
    )
    const result = await captureActions().approve(mapLeaveRequest(backendLeave())!)
    expect(result).toEqual({ ok: false, message: MULTI_LEVEL_WORKFLOW_MESSAGE })
  })

  it('returns entitled days after an adjustment and summaries after runs', async () => {
    stubFetch((request) =>
      new URL(request.url).pathname.endsWith('/adjustments')
        ? jsonResponse(201, envelope({ id: 'adj-1', employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: 1, reason: 'Fix', entitledDays: 13 }))
        : jsonResponse(200, envelope({ expiredCount: 2, skippedDuplicate: 0, skippedManual: 0, year: 2026 })),
    )
    const actions = captureActions()
    expect(await actions.adjustBalance({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', year: 2026, amount: 1, reason: 'Fix' })).toEqual({ ok: true, entitledDays: 13 })
    expect(await actions.expireCarryForward({ year: 2026 })).toEqual({ ok: true, summary: 'Carry-forward expiry for 2026: 2 balances expired, 0 already processed.' })
  })
})

// ---------------------------------------------------------------------------
// Apply validation in server mode
// ---------------------------------------------------------------------------

describe('apply validation with server balances', () => {
  const settings = buildServerLeaveSettings(TYPES)
  const employee = leaveEmployeeFromEmbed({ id: 'emp-1', firstName: 'Asha', lastName: 'Rao' })!
  const input = { employeeId: 'emp-1', leaveTypeCode: 'CL', fromDate: '2030-01-07', toDate: '2030-01-08', reason: 'Trip' }

  it('warns instead of blocking when days exceed the server balance', () => {
    const result = validateLeaveRequest(input, settings, employee, [], [], [employee], { availableByType: { CL: 1 } })
    expect(result.errors).toEqual([])
    expect(result.daysCounted).toBe(2)
    expect(result.extraLwpDays).toBe(1)
    expect(result.warnings).toContain('1 day(s) exceed the available balance and will be recorded as loss of pay.')
  })

  it('skips the balance check while the balance is unknown', () => {
    const result = validateLeaveRequest(input, settings, employee, [], [], [employee], { availableByType: null })
    expect(result.errors).toEqual([])
    expect(result.extraLwpDays).toBe(0)
  })

  it('counts a half day and rejects half days over several dates', () => {
    const half = validateLeaveRequest({ ...input, toDate: '2030-01-07', portion: 'first_half' }, settings, employee, [], [], [employee], { availableByType: { CL: 5 } })
    expect(half.errors).toEqual([])
    expect(half.daysCounted).toBe(0.5)
    const spanning = validateLeaveRequest({ ...input, portion: 'first_half' }, settings, employee, [], [], [employee], { availableByType: { CL: 5 } })
    expect(spanning.errors).toContain('Half-day leave must start and end on the same date.')
  })
})

// ---------------------------------------------------------------------------
// Server-mode screens
// ---------------------------------------------------------------------------

describe('server-mode screens', () => {
  it('explains the missing org-wide calendar permission instead of showing data', () => {
    const html = render(createElement(CalendarTab, { viewer: HR_VIEWER, scope: 'org' }), { features: ['leave.requests', 'leave.approve'], snapshot: serverSnapshot() })
    expect(html).toContain('organisation-wide leave calendar needs the permission to apply leave on behalf')
  })

  it('shows the employee-record notice for personal views while the employee id is unknown', () => {
    const employeeViewer: LeaveViewer = { ...HR_VIEWER, role: 'EMPLOYEE' }
    const views = [
      render(createElement(MyLeaveTab, { viewer: employeeViewer }), { snapshot: serverSnapshot() }),
      render(createElement(CalendarTab, { viewer: employeeViewer, scope: 'self' }), { snapshot: serverSnapshot() }),
    ]
    for (const html of views) {
      expect(html).toContain(EMPLOYEE_RECORD_UNAVAILABLE_MESSAGE.replace("couldn't", 'couldn&#x27;t'))
      expect(html).toContain('Please contact your HR administrator if this continues.')
      expect(html).not.toMatch(/not linked|does not exist|no employee record/i)
    }
  })

  it('keeps personal leave blocked without a verified employee id', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope({})))
    const employeeViewer: LeaveViewer = { ...HR_VIEWER, role: 'EMPLOYEE', employeeId: null }
    const html = render(createElement(MyLeaveTab, { viewer: employeeViewer }), { snapshot: serverSnapshot() })

    // No personal content or apply control is rendered, and nothing is requested.
    expect(html).not.toContain('Apply for leave')
    expect(html).not.toContain('Asha Rao')
    expect(calls).toHaveLength(0)

    // The apply payload is refused client-side instead of guessing an id.
    expect(buildApplyLeaveBody({ employeeId: null, leaveTypeCode: 'CL', fromDate: '2030-01-07', toDate: '2030-01-07', reason: '' }, TYPES)).toEqual({
      ok: false,
      error: LEAVE_EMPLOYEE_NOT_LINKED,
    })
    expect(LEAVE_EMPLOYEE_NOT_LINKED).not.toMatch(/not linked/i)
    expect(calls).toHaveLength(0)
  })

  it('maps employeeId from auth onto the leave viewer when present', () => {
    const unlinked = resolveLeaveViewer({
      user: { id: 'user-1', email: 'akash@example.test', role: 'EMPLOYEE', roles: ['EMPLOYEE'], permissions: ['leaves:create'], isActive: true },
      workspaceRole: 'EMPLOYEE',
      demoRole: 'HR_ADMIN',
    })
    expect(unlinked).toMatchObject({ employeeId: null, actorId: 'user-1', source: 'authenticated' })
    const linked = resolveLeaveViewer({
      user: {
        id: 'user-1',
        email: 'akash@example.test',
        role: 'EMPLOYEE',
        roles: ['EMPLOYEE'],
        permissions: ['leaves:create'],
        isActive: true,
        employeeId: 'emp-linked-1',
      },
      workspaceRole: 'EMPLOYEE',
      demoRole: 'HR_ADMIN',
    })
    expect(linked).toMatchObject({ employeeId: 'emp-linked-1', actorId: 'user-1', source: 'authenticated' })
  })

  it('lists server requests for HR and explains missing list permission', () => {
    const allowed = render(createElement(HrRequestsTab, { viewer: HR_VIEWER, initialSegment: 'all' }), {
      features: ['leave.requests', 'leave.approve'],
      snapshot: serverSnapshot(),
    })
    expect(allowed).toContain('Asha Rao')
    const denied = render(createElement(HrRequestsTab, { viewer: HR_VIEWER, initialSegment: 'all' }), {
      features: ['leave.types'],
      snapshot: serverSnapshot({ requests: false, orgWideRequests: false }),
    })
    expect(denied).toContain('You do not have permission to view leave requests across the organisation.')
  })

  it('says comp-off is not available from the server', () => {
    const html = render(createElement(HrRequestsTab, { viewer: HR_VIEWER, initialSegment: 'compoff' }), { features: ['leave.requests', 'leave.approve'], snapshot: serverSnapshot() })
    expect(html).toContain('Comp-off requests are not available from the server yet.')
  })

  it('gates server balances on create-on-behalf and the employee directory', () => {
    expect(render(createElement(ApiBalancesTab), { features: ['leave.balances'], snapshot: serverSnapshot() })).toContain('needs the permission to apply leave on behalf')
    expect(render(createElement(ApiBalancesTab), { features: ['leave.balances', 'leave.createOnBehalf'], snapshot: serverSnapshot() })).toContain(
      'Listing employees needs access to the employee directory.',
    )
    const listed = render(createElement(ApiBalancesTab), {
      features: ['leave.balances', 'leave.createOnBehalf', 'employee.directory'],
      snapshot: serverSnapshot({ employeeDirectory: true }),
    })
    expect(listed).toContain('Asha Rao')
  })

  it('renders server leave types read-only', () => {
    const html = render(createElement(ApiLeaveSettingsTab), { features: ['leave.types'], snapshot: serverSnapshot() })
    expect(html).toContain('These settings are read-only here.')
    expect(html).toContain('Casual Leave')
    expect(html).toContain('Illness')
    expect(html).not.toContain('Entitlement defaults')
  })
})

describe('calendar month grid', () => {
  it('uses local calendar dates for every cell and rolls month overflow', () => {
    const cells = monthMatrix(2026, 10).flat().filter((cell): cell is string => Boolean(cell))
    expect(cells[0]).toBe('2026-11-01')
    expect(cells).toHaveLength(30)
    expect(cells.at(-1)).toBe('2026-11-30')
    expect(monthMatrix(2026, 12).flat().find(Boolean)).toBe('2027-01-01')
  })
})
