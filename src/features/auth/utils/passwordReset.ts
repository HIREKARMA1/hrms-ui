/**
 * Forgot / reset password flow logic, kept free of React so it can be tested
 * with a mocked `fetch`.
 *
 * Backend contract (hrms-server auth.controller / dto / auth.service):
 * - POST /auth/forgot-password `{ email }` -> 200 generic `{ success, message,
 *   data: null }` for any email; 429 when rate limited.
 * - POST /auth/reset-password `{ token, newPassword }` (password 8-128 chars)
 *   -> 200 `data: null`; 401 for an invalid, expired or used token; 429.
 * - The emailed link is `<APP_URL>/reset-password?token=<token>`.
 *
 * Tokens and passwords are never logged, put in messages or persisted.
 */

import { getApiErrorMessage } from '@/services/api/errors'

import type { ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth.types'
import { LOGIN_PATH } from './sessionRedirect'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Same text the server sends; shown for every email so none is confirmed. */
export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'If an account exists for that email, password reset instructions have been sent.'

export const RESET_TOKEN_REJECTED_MESSAGE =
  'This reset link is invalid, has expired, or has already been used. Please request a new one.'

export const RESET_LINK_MISSING_MESSAGE =
  'This password reset link is incomplete. Please open the link from your email again, or request a new one.'

/** Router state the login screen reads to confirm the reset. */
export const PASSWORD_RESET_LOGIN_STATE = { passwordReset: true } as const

export const PASSWORD_RESET_DONE_MESSAGE = 'Password updated. Sign in with your new password.'

export function hasPasswordResetState(routerState: unknown): boolean {
  return (
    typeof routerState === 'object' &&
    routerState !== null &&
    (routerState as { passwordReset?: unknown }).passwordReset === true
  )
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ForgotPasswordErrors = { email?: string }

export function validateForgotPasswordInput(email: string): ForgotPasswordErrors {
  const value = email.trim()
  if (!value) return { email: 'Email is required.' }
  if (!EMAIL_PATTERN.test(value)) return { email: 'Enter a valid email address.' }
  return {}
}

export type ResetPasswordErrors = { newPassword?: string; confirmPassword?: string }

/** Passwords are not trimmed (the server does not trim them either). */
export function validateResetPasswordInput(newPassword: string, confirmPassword: string): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {}
  if (!newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  } else if (newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.'
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

/** The one-time token from `?token=`; null when absent or blank. */
export function parseResetToken(search: string): string | null {
  const token = new URLSearchParams(search).get('token')?.trim()
  return token ? token : null
}

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

function statusOf(error: unknown): unknown {
  return typeof error === 'object' && error !== null ? (error as { status?: unknown }).status : undefined
}

const FORGOT_FALLBACK = "We couldn't process your request. Please try again."
const RESET_FALLBACK = "We couldn't reset your password. Please try again."

/** Never uses a response body, so nothing about the account can leak. */
export function getForgotPasswordErrorMessage(error: unknown): string {
  if (statusOf(error) === 400) return 'Enter a valid email address.'
  return getFixedErrorMessage(error, FORGOT_FALLBACK)
}

export function isResetTokenRejected(error: unknown): boolean {
  return statusOf(error) === 401
}

export function getResetPasswordErrorMessage(error: unknown): string {
  if (isResetTokenRejected(error)) return RESET_TOKEN_REJECTED_MESSAGE
  if (statusOf(error) === 400) {
    return `Your new password was not accepted. Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`
  }
  return getFixedErrorMessage(error, RESET_FALLBACK)
}

/** Network, timeout and rate-limit wording from the shared helper; other statuses use `fallback`. */
function getFixedErrorMessage(error: unknown, fallback: string): string {
  const status = statusOf(error)
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 429) {
    return getApiErrorMessage(error, fallback)
  }
  return fallback
}

// ---------------------------------------------------------------------------
// Submission flows
// ---------------------------------------------------------------------------

/** Synchronous re-entry lock: unlike `disabled`, it holds before React re-renders. */
export type SubmitGuard = { tryEnter: () => boolean; leave: () => void }

export function createSubmitGuard(): SubmitGuard {
  let busy = false
  return {
    tryEnter: () => {
      if (busy) return false
      busy = true
      return true
    },
    leave: () => {
      busy = false
    },
  }
}

/** A dispatched mutation, e.g. `dispatch(authApi.endpoints.x.initiate(arg, { track: false }))`. */
export type SendMutation<TArg> = (arg: TArg) => { unwrap: () => Promise<unknown> }

export type ForgotPasswordOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: ForgotPasswordErrors }
  | { status: 'success' }
  | { status: 'error'; message: string }

export async function submitForgotPassword(input: {
  email: string
  send: SendMutation<ForgotPasswordRequest>
  guard: SubmitGuard
}): Promise<ForgotPasswordOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateForgotPasswordInput(input.email)
    if (errors.email) return { status: 'invalid', errors }
    await input.send({ email: input.email.trim() }).unwrap()
    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: getForgotPasswordErrorMessage(error) }
  } finally {
    input.guard.leave()
  }
}

export type ResetPasswordNavigate = (
  to: string,
  options: { replace: true; state: typeof PASSWORD_RESET_LOGIN_STATE },
) => void

export type ResetPasswordOutcome =
  | { status: 'busy' }
  | { status: 'missing-token'; message: string }
  | { status: 'invalid'; errors: ResetPasswordErrors }
  | { status: 'success' }
  | { status: 'error'; message: string; tokenRejected: boolean }

/**
 * Validates, submits and, on success, goes to Login. The user is not signed
 * in: the endpoint returns no tokens and none are requested.
 */
export async function submitResetPassword(input: {
  token: string | null
  newPassword: string
  confirmPassword: string
  send: SendMutation<ResetPasswordRequest>
  navigate: ResetPasswordNavigate
  guard: SubmitGuard
}): Promise<ResetPasswordOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    if (!input.token) return { status: 'missing-token', message: RESET_LINK_MISSING_MESSAGE }
    const errors = validateResetPasswordInput(input.newPassword, input.confirmPassword)
    if (errors.newPassword || errors.confirmPassword) return { status: 'invalid', errors }
    await input.send({ token: input.token, newPassword: input.newPassword }).unwrap()
    input.navigate(LOGIN_PATH, { replace: true, state: PASSWORD_RESET_LOGIN_STATE })
    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: getResetPasswordErrorMessage(error), tokenRejected: isResetTokenRejected(error) }
  } finally {
    input.guard.leave()
  }
}
