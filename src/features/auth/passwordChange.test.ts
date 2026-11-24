/**
 * Change password integration.
 *
 * MOCK-BASED ONLY: every request hits a stubbed `fetch`; payloads and status
 * codes mirror the hrms-server source (auth.controller, change-password.dto,
 * auth.service) and its e2e spec. No real backend is contacted.
 */
import { configureStore } from '@reduxjs/toolkit'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import appSource from '@/App.tsx?raw'
import headerSource from '@/components/layout/Header.tsx?raw'
import { baseApi, registerAuthSessionHandlers, setSessionEnding } from '@/services/api/baseApi'

import { authApi } from './api/authApi'
import { ChangePasswordForm } from './components/ChangePasswordForm'
import { createAuthSessionHandlers } from './store/authSessionHandlers'
import { authReducer, clearRefreshToken } from './store/authSlice'
import type { AuthUser, ChangePasswordRequest } from './types/auth.types'
import {
  CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE,
  CHANGE_PASSWORD_SUCCESS_MESSAGE,
  CHANGE_PASSWORD_WRONG_CURRENT_MESSAGE,
  createSubmitGuard,
  PASSWORD_MAX_LENGTH,
  submitChangePassword,
  validateChangePasswordInput,
  type SendMutation,
} from './utils/passwordChange'
import { isStoredAuth } from './utils/authStorage'

const USER: AuthUser = {
  id: 'user-1',
  email: 'priya.sharma@example.test',
  role: 'HR_ADMIN',
  roles: ['HR_ADMIN'],
  permissions: ['employees:read'],
  isActive: true,
}

const CURRENT = 'OldPassword1'
const NEXT = 'NewStrongPassword123!'
const SUCCESS_BODY = {
  success: true,
  message: 'Password changed successfully',
  data: null,
}

function makeStore(auth: { accessToken?: string | null; refreshToken?: string | null } = {}) {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: auth.accessToken === undefined ? 'access-1' : auth.accessToken,
        refreshToken: auth.refreshToken === undefined ? 'refresh-1' : auth.refreshToken,
        user: USER,
        rememberMe: true,
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

function senders(store: ReturnType<typeof makeStore>['store']): SendMutation<ChangePasswordRequest> {
  return (arg) => store.dispatch(authApi.endpoints.changePassword.initiate(arg, { track: false }))
}

const path = (request: Request) => new URL(request.url).pathname.replace(/^.*\/api\/v1/, '')

async function change(
  overrides: Partial<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }> = {},
  store = makeStore().store,
  onRefreshRevoked = vi.fn(() => {
    store.dispatch(clearRefreshToken())
  }),
) {
  const outcome = await submitChangePassword({
    currentPassword: CURRENT,
    newPassword: NEXT,
    confirmPassword: NEXT,
    ...overrides,
    send: senders(store),
    onRefreshRevoked,
    guard: createSubmitGuard(),
  })
  return { outcome, store, onRefreshRevoked }
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

describe('change password', () => {
  it('posts the exact backend payload with the bearer token', async () => {
    const calls = stubFetch(() => jsonResponse(200, SUCCESS_BODY))
    const { outcome, store, onRefreshRevoked } = await change()

    expect(outcome).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('POST')
    expect(path(calls[0])).toBe('/auth/change-password')
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-1')
    expect(await calls[0].json()).toEqual({ currentPassword: CURRENT, newPassword: NEXT })
    expect(onRefreshRevoked).toHaveBeenCalledTimes(1)
    // Access session kept; revoked refresh dropped. No passwords in the store.
    expect(store.getState().auth).toMatchObject({
      accessToken: 'access-1',
      refreshToken: null,
      user: USER,
    })
    const serialised = JSON.stringify(store.getState())
    expect(serialised).not.toContain(CURRENT)
    expect(serialised).not.toContain(NEXT)
  })

  it('does not keep the request in the RTK Query store', async () => {
    stubFetch(() => jsonResponse(200, SUCCESS_BODY))
    const { store } = await change()
    expect(JSON.stringify(store.getState())).not.toContain(CURRENT)
    expect(JSON.stringify(store.getState())).not.toContain(NEXT)
  })

  it('rejects an incorrect current password without signing the user out', async () => {
    const calls = stubFetch((request) => {
      if (path(request).endsWith('/auth/refresh')) {
        return jsonResponse(200, {
          success: true,
          message: 'Token refreshed',
          data: {
            accessToken: 'access-2',
            refreshToken: 'refresh-2',
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: USER,
          },
        })
      }
      return jsonResponse(401, { statusCode: 401, message: 'Invalid current password' })
    })
    const { store, onExpired } = makeStore()
    const { outcome, onRefreshRevoked } = await change({}, store)

    expect(outcome).toEqual({ status: 'error', message: CHANGE_PASSWORD_WRONG_CURRENT_MESSAGE })
    expect(onRefreshRevoked).not.toHaveBeenCalled()
    expect(onExpired).not.toHaveBeenCalled()
    expect(store.getState().auth.user).toEqual(USER)
    expect(store.getState().auth.accessToken).toBeTruthy()
    // Wrong-password 401 may rotate the access token via reauth; never ends the session.
    expect(calls.some((call) => path(call) === '/auth/change-password')).toBe(true)
  })

  it('rejects when the new password matches the current password without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(200, SUCCESS_BODY))
    const { outcome, onRefreshRevoked } = await change({
      currentPassword: CURRENT,
      newPassword: CURRENT,
      confirmPassword: CURRENT,
    })

    expect(outcome).toEqual({
      status: 'invalid',
      errors: { newPassword: CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE },
    })
    expect(calls).toHaveLength(0)
    expect(onRefreshRevoked).not.toHaveBeenCalled()
  })

  it('surfaces the backend same-password 400', async () => {
    stubFetch(() =>
      jsonResponse(400, {
        statusCode: 400,
        message: 'New password must be different from the current password',
      }),
    )
    const { outcome, onRefreshRevoked } = await change()
    expect(outcome).toEqual({ status: 'error', message: CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE })
    expect(onRefreshRevoked).not.toHaveBeenCalled()
  })

  it('rejects mismatched confirmation and empty fields without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(200, SUCCESS_BODY))

    expect(await change({ confirmPassword: 'Different-Pass-1' })).toMatchObject({
      outcome: { status: 'invalid', errors: { confirmPassword: 'Passwords do not match.' } },
    })
    expect(validateChangePasswordInput('', '', '')).toEqual({
      currentPassword: 'Current password is required.',
      newPassword: 'New password is required.',
      confirmPassword: 'Please confirm your new password.',
    })
    expect(calls).toHaveLength(0)
  })

  it.each([
    ['7 characters', 'abcdefg', 'Password must be at least 8 characters.'],
    ['129 characters', 'a'.repeat(PASSWORD_MAX_LENGTH + 1), 'Password must be at most 128 characters.'],
  ])('applies the backend password length rule (%s)', async (_label, password, message) => {
    const calls = stubFetch(() => jsonResponse(200, SUCCESS_BODY))
    const { outcome } = await change({ newPassword: password, confirmPassword: password })
    expect(outcome).toMatchObject({ status: 'invalid', errors: { newPassword: message } })
    expect(calls).toHaveLength(0)
  })

  it('accepts the 8 and 128 character boundaries', () => {
    expect(validateChangePasswordInput(CURRENT, 'a'.repeat(8), 'a'.repeat(8))).toEqual({})
    expect(validateChangePasswordInput(CURRENT, 'a'.repeat(128), 'a'.repeat(128))).toEqual({})
  })

  it('maps a short-password 400 from the API to a fixed message', async () => {
    stubFetch(() => jsonResponse(400, { statusCode: 400, message: ['newPassword: Too small'] }))
    const { outcome } = await change()
    expect(outcome).toEqual({
      status: 'error',
      message: 'Your new password was not accepted. Use 8 to 128 characters.',
    })
  })

  it('reports an expired session when refresh also fails', async () => {
    stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
    const { store, onExpired } = makeStore()
    const { outcome } = await change({}, store)

    expect(outcome).toEqual({
      status: 'error',
      message: 'Your session has expired. Please sign in again and try changing your password.',
    })
    expect(onExpired).toHaveBeenCalled()
    expect(store.getState().auth.accessToken).toBeNull()
  })

  it('reports a network failure without clearing the session', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const { store } = makeStore()
    const { outcome, onRefreshRevoked } = await change({}, store)

    expect(outcome).toEqual({
      status: 'error',
      message: 'Unable to reach the server. Check your connection and try again.',
    })
    expect(onRefreshRevoked).not.toHaveBeenCalled()
    expect(store.getState().auth).toMatchObject({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: USER,
    })
  })

  it('never echoes unexpected backend bodies', async () => {
    stubFetch(() =>
      jsonResponse(500, {
        statusCode: 500,
        message: `hash=${CURRENT} user=${USER.email}`,
      }),
    )
    const { outcome } = await change()
    expect(outcome).toEqual({
      status: 'error',
      message: "We couldn't change your password. Please try again.",
    })
    expect(JSON.stringify(outcome)).not.toContain(CURRENT)
    expect(JSON.stringify(outcome)).not.toContain(USER.email)
  })
})

describe('duplicate submissions', () => {
  it('a second submit while one is in flight sends nothing', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const store = makeStore().store
    const guard = createSubmitGuard()
    const onRefreshRevoked = vi.fn(() => {
      store.dispatch(clearRefreshToken())
    })
    const input = {
      currentPassword: CURRENT,
      newPassword: NEXT,
      confirmPassword: NEXT,
      send: senders(store),
      onRefreshRevoked,
      guard,
    }

    const first = submitChangePassword(input)
    const second = await submitChangePassword(input)
    await vi.waitFor(() => expect(calls).toHaveLength(1))

    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(200, SUCCESS_BODY))
    expect(await first).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
    expect(onRefreshRevoked).toHaveBeenCalledTimes(1)
  })

  it('a failed attempt releases the lock so the user can retry', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const store = makeStore().store
    const guard = createSubmitGuard()
    const input = {
      currentPassword: CURRENT,
      newPassword: NEXT,
      confirmPassword: NEXT,
      send: senders(store),
      onRefreshRevoked: vi.fn(),
      guard,
    }

    expect((await submitChangePassword(input)).status).toBe('error')
    stubFetch(() => jsonResponse(200, SUCCESS_BODY))
    expect((await submitChangePassword(input)).status).toBe('success')
  })
})

describe('UI and routing', () => {
  it('registers the authenticated change-password route and header entry', () => {
    expect(appSource).toContain('path="/account/change-password"')
    expect(headerSource).toContain('Change password')
    expect(headerSource).toContain('/account/change-password')
  })

  it('renders the three password fields with show/hide controls', () => {
    const html = renderToStaticMarkup(
      createElement(Provider, {
        store: makeStore().store,
        children: createElement(MemoryRouter, null, createElement(ChangePasswordForm)),
      }),
    )
    expect(html).toContain('Current Password')
    expect(html).toContain('New Password')
    expect(html).toContain('Confirm New Password')
    expect(html.match(/aria-label="Show password"/g)).toHaveLength(3)
    expect(html).not.toContain(CHANGE_PASSWORD_SUCCESS_MESSAGE)
  })

  it('persists an access-only session after refresh revocation', () => {
    expect(
      isStoredAuth({
        accessToken: 'access-1',
        refreshToken: null,
        user: USER,
        rememberMe: true,
      }),
    ).toBe(true)
  })
})
