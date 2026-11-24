/**
 * Stage 4.6.1: /auth/me cache handling, login/refresh validation and logout.
 *
 * Mock-based only: every request hits a stubbed `fetch`; payloads mirror the
 * hrms-server source (auth.controller `me`, auth.service login/refresh,
 * toPublicAuthUser). No real backend is contacted and no real tokens are used.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { employeesApi } from '@/features/employees/api/employeesApi'
import { baseApi, registerAuthSessionHandlers, setSessionEnding } from '@/services/api/baseApi'

import { AUTH_RESPONSE_ERRORS, authApi, isAuthResponseError } from './api/authApi'
import { createAuthSessionHandlers } from './store/authSessionHandlers'
import { authReducer, clearCredentials, type AuthState } from './store/authSlice'
import type { AuthUser } from './types/auth.types'
import {
  parseAuthUserStrict,
  parseCurrentUserResponse,
  resolveRefreshedUser,
} from './utils/authUser'
import { getSessionCheckErrorMessage, isUnusableSessionError } from './utils/sessionCheck'

const STORED_USER: AuthUser = {
  id: 'user-1',
  email: 'priya.sharma@example.test',
  role: 'HR_ADMIN',
  roles: ['HR_ADMIN'],
  permissions: ['employees:read'],
  isActive: true,
}

const FRESH_USER: AuthUser = {
  ...STORED_USER,
  roles: ['EMPLOYEE', 'HR_ADMIN'],
  permissions: ['employees:read', 'leave_requests:create'],
}

function meBody(user: unknown = FRESH_USER) {
  return { success: true, message: 'Authenticated', data: { user } }
}

function makeStore(auth: Partial<AuthState> = {}) {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: 'test-access',
        refreshToken: 'test-refresh',
        user: STORED_USER,
        rememberMe: true,
        ...auth,
      },
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

function path(request: Request) {
  return new URL(request.url).pathname
}

async function fetchMe(store: ReturnType<typeof makeStore>['store']) {
  return store.dispatch(authApi.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

describe('GET /auth/me', () => {
  it('200: requests with no-store + Bearer and syncs the verified user', async () => {
    const calls = stubFetch(() => jsonResponse(200, meBody()))
    const { store } = makeStore()
    const result = await fetchMe(store)

    expect(result.data).toEqual(FRESH_USER)
    expect(calls).toHaveLength(1)
    expect(path(calls[0]).endsWith('/auth/me')).toBe(true)
    expect(calls[0].cache).toBe('no-store')
    expect(calls[0].headers.get('Authorization')).toBe('Bearer test-access')
    // No conditional / cache headers are added by the app (CORS-safe).
    expect(calls[0].headers.get('Cache-Control')).toBeNull()
    expect(calls[0].headers.get('If-None-Match')).toBeNull()
    expect(store.getState().auth.user).toEqual(FRESH_USER)
    expect(store.getState().auth.accessToken).toBe('test-access')
    expect(store.getState().auth.rememberMe).toBe(true)
  })

  it('304: is an explicit error and the stored user is not re-verified', async () => {
    stubFetch(() => new Response(null, { status: 304 }))
    const { store, onExpired } = makeStore()
    const result = await fetchMe(store)

    expect(result.isError).toBe(true)
    expect(isAuthResponseError(result.error, AUTH_RESPONSE_ERRORS.notModified)).toBe(true)
    expect(isUnusableSessionError(result.error)).toBe(false)
    expect(getSessionCheckErrorMessage(result.error)).toBe(
      'The server returned an unexpected session response. Please try again.',
    )
    expect(store.getState().auth.user).toBe(STORED_USER)
    expect(store.getState().auth.accessToken).toBe('test-access')
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('200 with an empty body is rejected, not unwrapped', async () => {
    stubFetch(() => new Response('', { status: 200 }))
    const { store } = makeStore()
    const result = await fetchMe(store)

    expect(result.isError).toBe(true)
    expect(isAuthResponseError(result.error, AUTH_RESPONSE_ERRORS.invalidResponse)).toBe(true)
    expect(store.getState().auth.user).toBe(STORED_USER)
  })

  it.each([
    ['no envelope', FRESH_USER],
    ['success false', { success: false, message: 'x', data: { user: FRESH_USER } }],
    ['data null', { success: true, message: 'ok', data: null }],
    ['user missing', { success: true, message: 'ok', data: {} }],
    ['user without roles', meBody({ ...FRESH_USER, roles: undefined })],
    ['user without email', meBody({ ...FRESH_USER, email: '' })],
    ['permissions not strings', meBody({ ...FRESH_USER, permissions: [1, 2] })],
  ])('invalid envelope (%s) keeps the stored user', async (_label, body) => {
    stubFetch(() => jsonResponse(200, body))
    const { store } = makeStore()
    const result = await fetchMe(store)

    expect(isAuthResponseError(result.error, AUTH_RESPONSE_ERRORS.invalidResponse)).toBe(true)
    expect(store.getState().auth.user).toBe(STORED_USER)
  })

  it('a different account ends the session instead of being adopted', async () => {
    stubFetch(() => jsonResponse(200, meBody({ ...FRESH_USER, id: 'someone-else' })))
    const { store } = makeStore()
    const result = await fetchMe(store)

    expect(isAuthResponseError(result.error, AUTH_RESPONSE_ERRORS.userMismatch)).toBe(true)
    expect(isUnusableSessionError(result.error)).toBe(true)
    expect(store.getState().auth.user).toBe(STORED_USER)
  })

  it.each([
    ['network failure', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['500', () => jsonResponse(500, { statusCode: 500, message: 'Internal server error' })],
    ['503', () => jsonResponse(503, { statusCode: 503, message: 'Service unavailable' })],
  ])('%s keeps the recoverable session', async (_label, respond) => {
    stubFetch(respond as () => Promise<Response>)
    const { store, onExpired } = makeStore()
    const result = await fetchMe(store)

    expect(result.isError).toBe(true)
    expect(isUnusableSessionError(result.error)).toBe(false)
    expect(store.getState().auth).toMatchObject({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      user: STORED_USER,
      rememberMe: true,
    })
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('a late response cannot restore a signed-out session', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(() => new Promise<Response>((resolve) => { release = resolve }))
    const { store } = makeStore()
    const pending = fetchMe(store)
    await vi.waitFor(() => expect(calls).toHaveLength(1))
    store.dispatch(clearCredentials())
    release(jsonResponse(200, meBody()))
    await pending

    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().auth.accessToken).toBeNull()
  })
})

describe('401 refresh and retry', () => {
  it('refreshes once, retries /auth/me and keeps rememberMe', async () => {
    const calls = stubFetch(async (request) => {
      if (path(request).endsWith('/auth/refresh')) {
        return jsonResponse(200, {
          success: true,
          message: 'Refreshed',
          data: { accessToken: 'test-access-2', refreshToken: 'test-refresh-2', tokenType: 'Bearer', expiresIn: '15m', user: FRESH_USER },
        })
      }
      return request.headers.get('Authorization') === 'Bearer test-access-2'
        ? jsonResponse(200, meBody())
        : jsonResponse(401, { statusCode: 401, message: 'Unauthorized' })
    })
    const { store, onExpired } = makeStore()
    const result = await fetchMe(store)

    expect(result.data).toEqual(FRESH_USER)
    expect(calls.map(path).map((p) => p.slice(p.lastIndexOf('/auth')))).toEqual(['/auth/me', '/auth/refresh', '/auth/me'])
    expect(await calls[1].json()).toEqual({ refreshToken: 'test-refresh' })
    expect(store.getState().auth).toMatchObject({
      accessToken: 'test-access-2',
      refreshToken: 'test-refresh-2',
      user: FRESH_USER,
      rememberMe: true,
    })
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('concurrent 401s share a single refresh', async () => {
    let refreshCount = 0
    stubFetch(async (request) => {
      if (path(request).endsWith('/auth/refresh')) {
        refreshCount += 1
        return jsonResponse(200, {
          success: true,
          message: 'Refreshed',
          data: { accessToken: 'test-access-2', refreshToken: 'test-refresh-2', tokenType: 'Bearer', expiresIn: '15m', user: FRESH_USER },
        })
      }
      if (request.headers.get('Authorization') !== 'Bearer test-access-2') {
        return jsonResponse(401, { statusCode: 401, message: 'Unauthorized' })
      }
      return path(request).endsWith('/auth/me')
        ? jsonResponse(200, meBody())
        : jsonResponse(200, { total: 0, skip: 0, take: 20, items: [] })
    })
    const { store } = makeStore()
    const [me, list] = await Promise.all([
      fetchMe(store),
      store.dispatch(employeesApi.endpoints.listEmployees.initiate({})),
    ])
    expect(refreshCount).toBe(1)
    expect(me.data).toEqual(FRESH_USER)
    expect(list.data?.total).toBe(0)
  })

  it('a refresh with an incomplete user keeps the current user', async () => {
    stubFetch(async (request) => {
      if (path(request).endsWith('/auth/refresh')) {
        return jsonResponse(200, {
          success: true,
          message: 'Refreshed',
          data: { accessToken: 'test-access-2', refreshToken: 'test-refresh-2', user: { id: 'user-1' } },
        })
      }
      return request.headers.get('Authorization') === 'Bearer test-access-2'
        ? jsonResponse(200, meBody(STORED_USER))
        : jsonResponse(401, { statusCode: 401, message: 'Unauthorized' })
    })
    const { store } = makeStore()
    await fetchMe(store)
    expect(store.getState().auth.user).toEqual(STORED_USER)
    expect(store.getState().auth.accessToken).toBe('test-access-2')
  })

  it('a rejected refresh expires the session', async () => {
    stubFetch(async (request) =>
      path(request).endsWith('/auth/refresh')
        ? jsonResponse(401, { statusCode: 401, message: 'Invalid refresh token' })
        : jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }),
    )
    const { store, onExpired } = makeStore()
    const result = await fetchMe(store)

    expect(isUnusableSessionError(result.error)).toBe(true)
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.user).toBeNull()
  })

  it('a refresh for a different account expires the session', async () => {
    stubFetch(async (request) =>
      path(request).endsWith('/auth/refresh')
        ? jsonResponse(200, {
            success: true,
            message: 'Refreshed',
            data: { accessToken: 'test-access-2', refreshToken: 'test-refresh-2', user: { ...FRESH_USER, id: 'other' } },
          })
        : jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }),
    )
    const { store, onExpired } = makeStore()
    await fetchMe(store)
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.user).toBeNull()
  })
})

describe('refreshed user rules', () => {
  it('accepts a complete same-account user, keeps the current one otherwise', () => {
    expect(resolveRefreshedUser(STORED_USER, FRESH_USER)).toEqual(FRESH_USER)
    expect(resolveRefreshedUser(STORED_USER, undefined)).toBe(STORED_USER)
    expect(resolveRefreshedUser(STORED_USER, { id: 'user-1', email: 'x@y.z' })).toBe(STORED_USER)
    expect(resolveRefreshedUser(STORED_USER, { ...FRESH_USER, id: 'other' })).toBeNull()
  })

  it('strict parsing never defaults missing fields', () => {
    expect(parseAuthUserStrict(FRESH_USER)).toEqual(FRESH_USER)
    expect(parseAuthUserStrict({ ...FRESH_USER, isActive: undefined })).toBeNull()
    expect(parseCurrentUserResponse(null)).toBeNull()
    expect(parseCurrentUserResponse('')).toBeNull()
  })

  it('accepts optional employeeId on login and me payloads', () => {
    expect(parseAuthUserStrict({ ...FRESH_USER, employeeId: 'emp-uuid-1' })).toEqual({
      ...FRESH_USER,
      employeeId: 'emp-uuid-1',
    })
    expect(parseAuthUserStrict({ ...FRESH_USER, employeeId: '  ' })).toEqual(FRESH_USER)
    expect(resolveRefreshedUser({ ...STORED_USER, employeeId: 'emp-1' }, FRESH_USER)).toEqual({
      ...FRESH_USER,
      employeeId: 'emp-1',
    })
  })
})

describe('login', () => {
  it('stores the returned user and the rememberMe choice', async () => {
    const calls = stubFetch(() =>
      jsonResponse(200, {
        success: true,
        message: 'Login successful',
        data: { accessToken: 'test-access-9', refreshToken: 'test-refresh-9', tokenType: 'Bearer', expiresIn: '15m', user: FRESH_USER },
      }),
    )
    const { store } = makeStore({ accessToken: null, refreshToken: null, user: null, rememberMe: false })
    await store
      .dispatch(authApi.endpoints.login.initiate({ email: 'priya.sharma@example.test', password: 'pw', rememberMe: true }))
      .unwrap()

    expect(await calls[0].json()).toEqual({ email: 'priya.sharma@example.test', password: 'pw' })
    expect(store.getState().auth).toEqual({
      accessToken: 'test-access-9',
      refreshToken: 'test-refresh-9',
      user: FRESH_USER,
      rememberMe: true,
    })
  })

  it('an invalid login response stores nothing', async () => {
    stubFetch(() => jsonResponse(200, { success: true, message: 'ok', data: { accessToken: 'a', refreshToken: 'b', user: { id: 'x' } } }))
    const { store } = makeStore({ accessToken: null, refreshToken: null, user: null, rememberMe: false })
    const result = await store.dispatch(
      authApi.endpoints.login.initiate({ email: 'a@b.test', password: 'pw' }),
    )
    expect('error' in result && isAuthResponseError(result.error, AUTH_RESPONSE_ERRORS.invalidResponse)).toBe(true)
    // The error never carries the response body (it could contain tokens).
    expect(JSON.stringify('error' in result ? result.error : {})).not.toContain('"a"')
    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.user).toBeNull()
  })
})

describe('logout', () => {
  it('POSTs the refresh token, and clearing credentials ends the session', async () => {
    const calls = stubFetch(() => jsonResponse(200, { success: true, message: 'Logged out', data: null }))
    const { store } = makeStore()
    await store.dispatch(authApi.endpoints.logout.initiate({ refreshToken: 'test-refresh' })).unwrap()
    store.dispatch(clearCredentials())

    expect(path(calls[0]).endsWith('/auth/logout')).toBe(true)
    expect(calls[0].headers.get('Authorization')).toBe('Bearer test-access')
    expect(await calls[0].json()).toEqual({ refreshToken: 'test-refresh' })
    expect(store.getState().auth).toEqual({ accessToken: null, refreshToken: null, user: null, rememberMe: false })
  })

  it('while signing out, a 401 does not refresh or restore the session', async () => {
    const calls = stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
    const { store, onExpired } = makeStore()
    setSessionEnding(true)
    await fetchMe(store)

    expect(calls.map(path).some((p) => p.endsWith('/auth/refresh'))).toBe(false)
    expect(onExpired).not.toHaveBeenCalled()
  })
})
