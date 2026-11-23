/**
 * Forgot / reset password integration.
 *
 * MOCK-BASED ONLY: every request hits a stubbed `fetch`; payloads and status
 * codes mirror the hrms-server source (auth.controller, forgot-password.dto,
 * reset-password.dto, auth.service) and its e2e spec. No real backend is
 * contacted, so none of this verifies the live server.
 */
import { configureStore } from '@reduxjs/toolkit'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import appSource from '@/App.tsx?raw'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { authApi } from './api/authApi'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { LoginForm } from './components/LoginForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { authReducer } from './store/authSlice'
import type { ForgotPasswordRequest, ResetPasswordRequest } from './types/auth.types'
import {
  createSubmitGuard,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  parseResetToken,
  PASSWORD_MAX_LENGTH,
  PASSWORD_RESET_DONE_MESSAGE,
  RESET_LINK_MISSING_MESSAGE,
  RESET_TOKEN_REJECTED_MESSAGE,
  submitForgotPassword,
  submitResetPassword,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  type SendMutation,
} from './utils/passwordReset'
import { getSafeReturnPath } from './utils/returnPath'
import { PUBLIC_PATHS } from './utils/sessionRedirect'

const TOKEN = 'dGVzdC1yZXNldC10b2tlbi0wMDAwMDAwMDAwMDAwMDAwMDAw'
const NEW_PASSWORD = 'CorrectHorse-9'

const GENERIC_FORGOT = { success: true, message: FORGOT_PASSWORD_SUCCESS_MESSAGE, data: null }
const RESET_OK = { success: true, message: 'Password reset successful', data: null }

function makeStore(signedIn = false) {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: signedIn ? 'test-access' : null,
        refreshToken: signedIn ? 'test-refresh' : null,
        user: null,
        rememberMe: false,
      },
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

function senders(store: ReturnType<typeof makeStore>) {
  const forgot: SendMutation<ForgotPasswordRequest> = (arg) =>
    store.dispatch(authApi.endpoints.forgotPassword.initiate(arg, { track: false }))
  const reset: SendMutation<ResetPasswordRequest> = (arg) =>
    store.dispatch(authApi.endpoints.resetPassword.initiate(arg, { track: false }))
  return { forgot, reset }
}

const path = (request: Request) => new URL(request.url).pathname.replace(/^.*\/api\/v1/, '')

async function forgot(email: string, store = makeStore()) {
  return submitForgotPassword({ email, send: senders(store).forgot, guard: createSubmitGuard() })
}

async function reset(
  overrides: { token?: string | null; newPassword?: string; confirmPassword?: string } = {},
  store = makeStore(),
  navigate = vi.fn(),
) {
  const outcome = await submitResetPassword({
    token: TOKEN,
    newPassword: NEW_PASSWORD,
    confirmPassword: NEW_PASSWORD,
    ...overrides,
    send: senders(store).reset,
    navigate,
    guard: createSubmitGuard(),
  })
  return { outcome, navigate, store }
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

describe('forgot password', () => {
  it('posts the exact backend payload for a valid email', async () => {
    const calls = stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    const outcome = await forgot('  akash@example.test  ')

    expect(outcome).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('POST')
    expect(path(calls[0])).toBe('/auth/forgot-password')
    expect(await calls[0].json()).toEqual({ email: 'akash@example.test' })
    expect(calls[0].headers.get('Content-Type')).toContain('application/json')
    expect(calls[0].cache).toBe('no-store')
  })

  it.each([
    ['empty', ''],
    ['blank', '   '],
    ['no at sign', 'akash.example.test'],
    ['no domain dot', 'akash@example'],
    ['inner space', 'ak ash@example.test'],
  ])('rejects an invalid email (%s) without calling the server', async (_label, email) => {
    const calls = stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    const outcome = await forgot(email)

    expect(outcome.status).toBe('invalid')
    expect(validateForgotPasswordInput(email).email).toBeTruthy()
    expect(calls).toHaveLength(0)
  })

  it('shows the same success for any email: the generic backend response reveals nothing', async () => {
    stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    const known = await forgot('known@example.test')
    const unknown = await forgot('missing@example.test')

    expect(known).toEqual(unknown)
    expect(FORGOT_PASSWORD_SUCCESS_MESSAGE).toBe(GENERIC_FORGOT.message)
    // Any 2xx counts as success; the body is never interpreted or echoed.
    stubFetch(() => new Response('', { status: 200 }))
    expect(await forgot('known@example.test')).toEqual({ status: 'success' })
    const html = renderToStaticMarkup(
      createElement(Provider, { store: makeStore(), children: createElement(MemoryRouter, null, createElement(ForgotPasswordForm)) }),
    )
    expect(html).not.toContain(FORGOT_PASSWORD_SUCCESS_MESSAGE)
  })

  it('reports rate limiting (429) without using the response body', async () => {
    stubFetch(() => jsonResponse(429, { statusCode: 429, message: 'Too Many Requests' }))
    expect(await forgot('akash@example.test')).toEqual({
      status: 'error',
      message: 'Too many attempts. Please wait a moment and try again.',
    })
  })

  it('maps a 400 to the email message and other failures to a fixed message', async () => {
    stubFetch(() => jsonResponse(400, { statusCode: 400, message: ['email: Invalid email address'] }))
    expect(await forgot('akash@example.test')).toEqual({ status: 'error', message: 'Enter a valid email address.' })

    stubFetch(() => jsonResponse(500, { statusCode: 500, message: 'Internal server error: user akash@example.test' }))
    const outcome = await forgot('akash@example.test')
    expect(outcome).toEqual({ status: 'error', message: "We couldn't process your request. Please try again." })
  })

  it('reports a network failure', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    expect(await forgot('akash@example.test')).toEqual({
      status: 'error',
      message: 'Unable to reach the server. Check your connection and try again.',
    })
  })

  it('does not keep the request in the store', async () => {
    stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    const store = makeStore()
    await forgot('akash@example.test', store)
    expect(JSON.stringify(store.getState())).not.toContain('akash@example.test')
  })

  it('the form asks for an email address, not an Employee ID', () => {
    const html = renderToStaticMarkup(
      createElement(Provider, { store: makeStore(), children: createElement(MemoryRouter, null, createElement(ForgotPasswordForm)) }),
    )
    expect(html).toContain('Email Address')
    expect(html).toContain('type="email"')
    expect(html).not.toContain('Employee ID')
  })
})

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------

describe('reset password', () => {
  it('posts the exact backend payload, then goes to Login without signing in', async () => {
    const calls = stubFetch(() => jsonResponse(200, RESET_OK))
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() }
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('sessionStorage', storage)

    const { outcome, navigate, store } = await reset()

    expect(outcome).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('POST')
    expect(path(calls[0])).toBe('/auth/reset-password')
    expect(await calls[0].json()).toEqual({ token: TOKEN, newPassword: NEW_PASSWORD })
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/', { replace: true, state: { passwordReset: true } })
    // No automatic authentication, nothing persisted, token/password not kept in the store.
    expect(store.getState().auth).toMatchObject({ accessToken: null, refreshToken: null, user: null })
    expect(storage.setItem).not.toHaveBeenCalled()
    const serialised = JSON.stringify(store.getState())
    expect(serialised).not.toContain(TOKEN)
    expect(serialised).not.toContain(NEW_PASSWORD)
  })

  it.each([
    ['invalid or expired', jsonResponse(401, { statusCode: 401, message: 'Invalid or expired reset token' })],
    ['already used', jsonResponse(401, { statusCode: 401, message: 'Invalid or expired reset token' })],
  ])('a %s token is rejected with a new-link message and no navigation', async (_label, response) => {
    stubFetch(() => response.clone())
    const { outcome, navigate } = await reset()

    expect(outcome).toEqual({ status: 'error', message: RESET_TOKEN_REJECTED_MESSAGE, tokenRejected: true })
    expect(JSON.stringify(outcome)).not.toContain(TOKEN)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('a rejected token never triggers a session refresh, even if a session exists', async () => {
    const calls = stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Invalid or expired reset token' }))
    const { outcome, store } = await reset({}, makeStore(true))

    expect(outcome).toMatchObject({ status: 'error', tokenRejected: true })
    expect(calls.map(path)).toEqual(['/auth/reset-password'])
    expect(store.getState().auth.accessToken).toBe('test-access')
  })

  it('rejects mismatched passwords without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(200, RESET_OK))
    const { outcome, navigate } = await reset({ confirmPassword: 'Different-Pass-1' })

    expect(outcome).toEqual({ status: 'invalid', errors: { confirmPassword: 'Passwords do not match.' } })
    expect(calls).toHaveLength(0)
    expect(navigate).not.toHaveBeenCalled()
  })

  it.each([
    ['empty', '', 'New password is required.'],
    ['7 characters', 'abcdefg', 'Password must be at least 8 characters.'],
    ['129 characters', 'a'.repeat(PASSWORD_MAX_LENGTH + 1), 'Password must be at most 128 characters.'],
  ])('applies the backend password length rule (%s)', async (_label, password, message) => {
    const calls = stubFetch(() => jsonResponse(200, RESET_OK))
    const { outcome } = await reset({ newPassword: password, confirmPassword: password })

    expect(outcome).toMatchObject({ status: 'invalid', errors: { newPassword: message } })
    expect(calls).toHaveLength(0)
  })

  it('accepts the 8 and 128 character boundaries and requires a confirmation', () => {
    expect(validateResetPasswordInput('a'.repeat(8), 'a'.repeat(8))).toEqual({})
    expect(validateResetPasswordInput('a'.repeat(128), 'a'.repeat(128))).toEqual({})
    expect(validateResetPasswordInput(NEW_PASSWORD, '')).toEqual({ confirmPassword: 'Please confirm your new password.' })
    // Passwords are not trimmed: spaces count, as on the server.
    expect(validateResetPasswordInput('  1234  ', '  1234  ')).toEqual({})
  })

  it('maps a backend 400, rate limit and network failure to safe messages', async () => {
    stubFetch(() => jsonResponse(400, { statusCode: 400, message: ['newPassword: Too small'] }))
    expect((await reset()).outcome).toEqual({
      status: 'error',
      message: 'Your new password was not accepted. Use 8 to 128 characters.',
      tokenRejected: false,
    })

    stubFetch(() => jsonResponse(429, { statusCode: 429, message: 'Too Many Requests' }))
    expect((await reset()).outcome).toMatchObject({ message: 'Too many attempts. Please wait a moment and try again.', tokenRejected: false })

    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const network = (await reset()).outcome
    expect(network).toMatchObject({ message: 'Unable to reach the server. Check your connection and try again.', tokenRejected: false })
  })

  it('reads the token from the backend link format and treats blank as missing', async () => {
    // auth.service builds `<APP_URL>/reset-password?token=<encodeURIComponent(token)>`.
    expect(parseResetToken(`?token=${encodeURIComponent(TOKEN)}`)).toBe(TOKEN)
    expect(parseResetToken('?token=%20abc%20')).toBe('abc')
    expect(parseResetToken('')).toBeNull()
    expect(parseResetToken('?token=')).toBeNull()
    expect(parseResetToken('?other=1')).toBeNull()

    const calls = stubFetch(() => jsonResponse(200, RESET_OK))
    const { outcome } = await reset({ token: null })
    expect(outcome).toEqual({ status: 'missing-token', message: RESET_LINK_MISSING_MESSAGE })
    expect(calls).toHaveLength(0)
  })

  it('renders the reset form for a token link without exposing the token', () => {
    const html = renderToStaticMarkup(
      createElement(Provider, {
        store: makeStore(),
        children: createElement(MemoryRouter, { initialEntries: [`/reset-password?token=${TOKEN}`] }, createElement(ResetPasswordForm)),
      }),
    )
    expect(html).toContain('New Password')
    expect(html).toContain('Confirm Password')
    expect(html.match(/aria-label="Show password"/g)).toHaveLength(2)
    expect(html).toContain('new-password')
    expect(html).not.toContain(TOKEN)
  })

  it('without a token the form is replaced by a new-link prompt', () => {
    const html = renderToStaticMarkup(
      createElement(Provider, {
        store: makeStore(),
        children: createElement(MemoryRouter, { initialEntries: ['/reset-password'] }, createElement(ResetPasswordForm)),
      }),
    )
    expect(html).not.toContain('Confirm Password')
    expect(html).toContain(RESET_LINK_MISSING_MESSAGE)
    expect(html).toContain('href="/forgot-password"')
  })
})

// ---------------------------------------------------------------------------
// Duplicate submissions
// ---------------------------------------------------------------------------

describe('duplicate submissions', () => {
  it('a second forgot-password submit while one is in flight sends nothing', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(() => new Promise<Response>((resolve) => { release = resolve }))
    const store = makeStore()
    const guard = createSubmitGuard()
    const input = { email: 'akash@example.test', send: senders(store).forgot, guard }

    const first = submitForgotPassword(input)
    const second = await submitForgotPassword(input)
    await vi.waitFor(() => expect(calls).toHaveLength(1))

    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(200, GENERIC_FORGOT))
    expect(await first).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)

    // The lock is released afterwards, so a later retry is allowed.
    stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    expect(await submitForgotPassword(input)).toEqual({ status: 'success' })
  })

  it('a second reset submit while one is in flight sends and navigates once', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(() => new Promise<Response>((resolve) => { release = resolve }))
    const store = makeStore()
    const navigate = vi.fn()
    const input = {
      token: TOKEN,
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
      send: senders(store).reset,
      navigate,
      guard: createSubmitGuard(),
    }

    const first = submitResetPassword(input)
    const second = await submitResetPassword(input)
    await vi.waitFor(() => expect(calls).toHaveLength(1))

    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(200, RESET_OK))
    expect(await first).toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
    expect(navigate).toHaveBeenCalledTimes(1)
  })

  it('a failed attempt releases the lock so the user can retry', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const store = makeStore()
    const guard = createSubmitGuard()
    const input = { email: 'akash@example.test', send: senders(store).forgot, guard }

    expect((await submitForgotPassword(input)).status).toBe('error')
    stubFetch(() => jsonResponse(200, GENERIC_FORGOT))
    expect((await submitForgotPassword(input)).status).toBe('success')
  })
})

// ---------------------------------------------------------------------------
// Routing and login
// ---------------------------------------------------------------------------

describe('routing and login', () => {
  it('registers a public /reset-password route', () => {
    expect(appSource).toContain('path="/reset-password"')
    expect(PUBLIC_PATHS).toContain('/reset-password')
    // The reset screen is never a post-login return target.
    const user = { id: 'u', email: 'a@b.co', role: 'HR_ADMIN', roles: ['HR_ADMIN'], permissions: [], isActive: true }
    expect(getSafeReturnPath({ from: '/reset-password' }, user)).toBeNull()
  })

  it('the login screen confirms a completed reset, and only then', () => {
    const render = (state: unknown) =>
      renderToStaticMarkup(
        createElement(Provider, {
          store: makeStore(),
          children: createElement(MemoryRouter, { initialEntries: [{ pathname: '/', state }] }, createElement(LoginForm)),
        }),
      )
    expect(render({ passwordReset: true })).toContain(PASSWORD_RESET_DONE_MESSAGE)
    expect(render(undefined)).not.toContain(PASSWORD_RESET_DONE_MESSAGE)
    expect(render({ from: '/employee/dashboard' })).not.toContain(PASSWORD_RESET_DONE_MESSAGE)
  })
})
