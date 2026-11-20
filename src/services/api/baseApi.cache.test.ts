/**
 * Browser HTTP cache policy of the shared base query.
 *
 * Every request must bypass the browser cache (`cache: 'no-store'`) without
 * conditional or Cache-Control request headers, a 304 or empty GET body must
 * never resolve as data, and RTK Query's in-memory cache and tag invalidation
 * must keep working. Mock-based only: `fetch` is stubbed, no backend is called.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '@/features/auth/api/authApi'
import { createAuthSessionHandlers } from '@/features/auth/store/authSessionHandlers'
import { authReducer } from '@/features/auth/store/authSlice'
import type { AuthUser } from '@/features/auth/types/auth.types'
import type { BackendEmployee } from '@/features/employees/api/employeeApi.types'
import { employeesApi } from '@/features/employees/api/employeesApi'
import { LEAVE_INVALID_RESPONSE, leaveApi } from '@/features/leave/api/leaveApi'

import { baseApi, EMPTY_RESPONSE_ERROR, registerAuthSessionHandlers, setSessionEnding } from './baseApi'

const USER: AuthUser = {
  id: 'user-1',
  email: 'hr@example.test',
  role: 'HR_ADMIN',
  roles: ['HR_ADMIN'],
  permissions: ['employees:read', 'leave_types:read'],
  isActive: true,
}

const envelope = (data: unknown) => ({ success: true, message: 'ok', data })

const LEAVE_TYPE = {
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
}

const LEAVE_TYPES_PAGE = envelope({
  items: [LEAVE_TYPE],
  pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
})

const LEAVE_REQUEST = {
  id: 'lv-1',
  employeeId: 'emp-1',
  leaveTypeId: 'lt-cl',
  startDate: '2026-11-23',
  endDate: '2026-11-23',
  dayPortion: 'FULL_DAY',
  totalDays: 1,
  reason: null,
  status: 'PENDING',
  appliedByUserId: 'user-1',
  reviewedByUserId: null,
  reviewedAt: null,
  reviewNote: null,
  cancelledAt: null,
  cancelReason: null,
  paidDays: 1,
  lopDays: 0,
  workflowId: null,
  currentLevel: null,
  createdAt: '2026-11-20T05:00:00.000Z',
  updatedAt: '2026-11-20T05:00:00.000Z',
  leaveType: { id: 'lt-cl', code: 'CL', name: 'Casual Leave', isPaid: true },
  employee: { id: 'emp-1', employeeCode: 'EMP001', firstName: 'Asha', lastName: 'Rao', email: 'asha@example.test' },
}

const EMPLOYEE = {
  id: 'emp-1',
  employeeCode: 'EMP001',
  firstName: 'Asha',
  lastName: 'Rao',
  designation: 'Engineer',
  email: 'asha@example.test',
  phone: '9876543210',
  aadhaar: null,
  pan: null,
  bloodGroup: null,
  photoUrl: null,
  dateOfBirth: null,
  uanNumber: null,
  dateOfJoining: '2024-01-15T00:00:00.000Z',
  employmentStatus: 'ACTIVE',
  role: 'EMPLOYEE',
  departmentId: null,
  deviceId: null,
  deviceUserId: null,
  deviceSyncStatus: 'NOT_SYNCED',
  deviceSyncError: null,
  deviceSyncedAt: null,
  createdAt: '2024-01-15T09:00:00.000Z',
  updatedAt: '2024-01-16T10:00:00.000Z',
  bankDetail: null,
  addresses: [],
  documents: [],
  department: null,
  user: null,
} as unknown as BackendEmployee

const DEVICE_SKIPPED = { status: 'skipped', message: 'No device linked' }

function makeStore() {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: { accessToken: 'access-1', refreshToken: 'refresh-1', user: USER, rememberMe: false },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
  const onExpired = vi.fn()
  registerAuthSessionHandlers(createAuthSessionHandlers(store, { onExpired }))
  return { store, onExpired }
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

const path = (request: Request) => new URL(request.url).pathname

function expectNoConditionalHeaders(request: Request) {
  expect(request.headers.get('If-None-Match')).toBeNull()
  expect(request.headers.get('If-Modified-Since')).toBeNull()
  expect(request.headers.get('Cache-Control')).toBeNull()
  expect(request.headers.get('Pragma')).toBeNull()
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

describe('browser cache policy', () => {
  it('200 GET: no-store, bearer token, no conditional headers or cache-busting params', async () => {
    const calls = stubFetch(() => jsonResponse(200, LEAVE_TYPES_PAGE))
    const { store } = makeStore()
    const page = await store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({ page: 1, limit: 100 })).unwrap()

    expect(page.items.map((type) => type.code)).toEqual(['CL'])
    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('GET')
    expect(calls[0].cache).toBe('no-store')
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-1')
    expectNoConditionalHeaders(calls[0])
    expect([...new URL(calls[0].url).searchParams.keys()].sort()).toEqual(['limit', 'page'])
  })

  it('applies to non-enveloped employee GETs and /auth/me too', async () => {
    const calls = stubFetch((request) =>
      path(request).endsWith('/auth/me')
        ? jsonResponse(200, envelope({ user: USER }))
        : jsonResponse(200, { total: 1, skip: 0, take: 20, items: [EMPLOYEE] }),
    )
    const { store } = makeStore()
    const page = await store.dispatch(employeesApi.endpoints.listEmployees.initiate({})).unwrap()
    const me = await store.dispatch(authApi.endpoints.getCurrentUser.initiate()).unwrap()

    expect(page.items[0].server.id).toBe('emp-1')
    expect(me).toEqual(USER)
    for (const call of calls) {
      expect(call.cache).toBe('no-store')
      expectNoConditionalHeaders(call)
    }
  })

  it('a 304 is an error, never a JSON envelope', async () => {
    stubFetch(() => new Response(null, { status: 304 }))
    const { store, onExpired } = makeStore()
    const leave = await store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({ page: 1, limit: 100 }))
    const employees = await store.dispatch(employeesApi.endpoints.getEmployeeSummary.initiate())

    expect(leave.data).toBeUndefined()
    expect((leave.error as { status: unknown }).status).toBe(304)
    expect(employees.data).toBeUndefined()
    expect((employees.error as { status: unknown }).status).toBe(304)
    expect(onExpired).not.toHaveBeenCalled()
    expect(store.getState().auth.accessToken).toBe('access-1')
  })

  it.each([
    ['empty 200', () => new Response('', { status: 200 })],
    ['empty 200 with a JSON content type', () => new Response('', { status: 200, headers: { 'Content-Type': 'application/json' } })],
    ['204', () => new Response(null, { status: 204 })],
  ])('%s on a GET is an error, not data', async (_label, respond) => {
    stubFetch(respond)
    const { store } = makeStore()
    const summary = await store.dispatch(employeesApi.endpoints.getEmployeeSummary.initiate())
    const employee = await store.dispatch(employeesApi.endpoints.getEmployee.initiate('emp-1'))
    const leave = await store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({}))

    expect(summary.data).toBeUndefined()
    expect(summary.error).toEqual({ status: 'CUSTOM_ERROR', error: EMPTY_RESPONSE_ERROR })
    expect(employee.error).toEqual({ status: 'CUSTOM_ERROR', error: EMPTY_RESPONSE_ERROR })
    expect(leave.error).toEqual({ status: 'CUSTOM_ERROR', error: LEAVE_INVALID_RESPONSE })
  })
})

describe('mutations', () => {
  it('POST, PATCH and DELETE keep their method, body, token and response handling', async () => {
    const calls = stubFetch((request) => {
      if (request.method === 'POST') return jsonResponse(201, envelope(LEAVE_REQUEST))
      if (request.method === 'PATCH') return jsonResponse(200, EMPLOYEE)
      return jsonResponse(200, {
        employee: { id: 'emp-1', employeeCode: 'EMP001', firstName: 'Asha', lastName: 'Rao', designation: 'Engineer', email: 'asha@example.test' },
        sync: { database: { status: 'success' }, device: DEVICE_SKIPPED },
      })
    })
    const { store } = makeStore()
    const applied = await store
      .dispatch(leaveApi.endpoints.applyLeave.initiate({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'FULL_DAY' }))
      .unwrap()
    const updated = await store.dispatch(employeesApi.endpoints.updateEmployee.initiate({ id: 'emp-1', body: { phone: '9876500000' } })).unwrap()
    const deleted = await store.dispatch(employeesApi.endpoints.deleteEmployee.initiate('emp-1')).unwrap()

    expect(applied.id).toBe('lv-1')
    expect(updated.record.server.id).toBe('emp-1')
    expect(deleted).toEqual({ employeeId: 'emp-1', name: 'Asha Rao', deviceSync: DEVICE_SKIPPED })
    expect(calls.map((call) => `${call.method} ${path(call).replace(/^.*\/api\/v1/, '')}`)).toEqual([
      'POST /leaves',
      'PATCH /employees/emp-1',
      'DELETE /employees/emp-1',
    ])
    expect(await calls[1].json()).toEqual({ phone: '9876500000' })
    for (const call of calls) {
      expect(call.headers.get('Authorization')).toBe('Bearer access-1')
      expectNoConditionalHeaders(call)
    }
  })

  it('an empty body on a non-GET is not turned into the empty-GET error', async () => {
    stubFetch(() => new Response(null, { status: 204 }))
    const { store } = makeStore()
    const result = await store.dispatch(leaveApi.endpoints.applyLeave.initiate({ employeeId: 'emp-1', leaveTypeId: 'lt-cl', startDate: '2026-11-23', endDate: '2026-11-23', dayPortion: 'FULL_DAY' }))
    expect(result.error).toEqual({ status: 'CUSTOM_ERROR', error: LEAVE_INVALID_RESPONSE })
  })
})

describe('token refresh', () => {
  it('a 401 GET refreshes once and the retry is still no-store with the new token', async () => {
    const calls = stubFetch((request) => {
      if (path(request).endsWith('/auth/refresh')) {
        return jsonResponse(200, envelope({ accessToken: 'access-2', refreshToken: 'refresh-2', tokenType: 'Bearer', expiresIn: '15m', user: USER }))
      }
      return request.headers.get('Authorization') === 'Bearer access-2'
        ? jsonResponse(200, LEAVE_TYPES_PAGE)
        : jsonResponse(401, { statusCode: 401, message: 'Unauthorized' })
    })
    const { store, onExpired } = makeStore()
    const page = await store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({ page: 1, limit: 100 })).unwrap()

    expect(page.items).toHaveLength(1)
    expect(calls.map((call) => `${call.method} ${path(call).replace(/^.*\/api\/v1/, '')}`)).toEqual([
      'GET /leave-types',
      'POST /auth/refresh',
      'GET /leave-types',
    ])
    expect(await calls[1].json()).toEqual({ refreshToken: 'refresh-1' })
    expect(calls[2].headers.get('Authorization')).toBe('Bearer access-2')
    for (const call of calls) {
      expect(call.cache).toBe('no-store')
      expectNoConditionalHeaders(call)
    }
    expect(store.getState().auth).toMatchObject({ accessToken: 'access-2', refreshToken: 'refresh-2' })
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('a rejected refresh still expires the session', async () => {
    stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
    const { store, onExpired } = makeStore()
    const result = await store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({}))

    expect((result.error as { status: unknown }).status).toBe(401)
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.accessToken).toBeNull()
  })
})

describe('RTK Query in-memory cache', () => {
  it('a second subscriber reuses cached data without another request', async () => {
    const calls = stubFetch(() => jsonResponse(200, LEAVE_TYPES_PAGE))
    const { store } = makeStore()
    const first = store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({ page: 1, limit: 100 }))
    await first
    const second = store.dispatch(leaveApi.endpoints.listLeaveTypes.initiate({ page: 1, limit: 100 }))
    const result = await second

    expect(result.data?.items).toHaveLength(1)
    expect(calls).toHaveLength(1)
    first.unsubscribe()
    second.unsubscribe()
  })

  it('a mutation invalidates provided tags and refetches subscribed queries', async () => {
    let summaryVersion = 0
    const calls = stubFetch((request) => {
      if (request.method === 'PATCH') return jsonResponse(200, EMPLOYEE)
      summaryVersion += 1
      return jsonResponse(200, envelope({ totalEmployees: summaryVersion }))
    })
    const { store } = makeStore()
    const summary = store.dispatch(employeesApi.endpoints.getEmployeeSummary.initiate())
    await summary
    expect(employeesApi.endpoints.getEmployeeSummary.select()(store.getState()).data).toEqual({ totalEmployees: 1 })

    await store.dispatch(employeesApi.endpoints.updateEmployee.initiate({ id: 'emp-1', body: { phone: '9876500000' } })).unwrap()

    await vi.waitFor(() => {
      expect(employeesApi.endpoints.getEmployeeSummary.select()(store.getState()).data).toEqual({ totalEmployees: 2 })
    })
    expect(calls.map((call) => call.method)).toEqual(['GET', 'PATCH', 'GET'])
    expect(calls[2].cache).toBe('no-store')
    summary.unsubscribe()
  })
})
