/**
 * Change-password flow logic, kept free of React so it can be tested with a
 * mocked `fetch`.
 *
 * Backend contract (hrms-server auth.controller / change-password.dto /
 * auth.service, and auth.e2e-spec):
 * - POST /auth/change-password (Bearer) `{ currentPassword, newPassword }`
 * - `currentPassword` min 1; `newPassword` 8–128 characters and must differ
 *   from the current password
 * - 200 `{ success, message: "Password changed successfully", data: null }`
 * - 401 for a wrong current password or a dead access token (same status;
 *   message for the former is "Invalid current password")
 * - 400 when the new password equals the current one
 * - On success every refresh token is revoked; the access JWT stays valid
 *
 * Passwords are never logged, put in messages or persisted.
 */

import { getApiErrorMessage } from '@/services/api/errors'

import type { ChangePasswordRequest } from '../types/auth.types'
import {
  createSubmitGuard,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type SendMutation,
  type SubmitGuard,
} from './passwordReset'

export { createSubmitGuard, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH }
export type { SendMutation, SubmitGuard }

export const CHANGE_PASSWORD_SUCCESS_MESSAGE = 'Password changed successfully.'

export const CHANGE_PASSWORD_WRONG_CURRENT_MESSAGE =
  'The current password you entered is incorrect.'

export const CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE =
  'Your new password must be different from your current password.'

export type ChangePasswordErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

/** Passwords are not trimmed (the server does not trim them either). */
export function validateChangePasswordInput(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): ChangePasswordErrors {
  const errors: ChangePasswordErrors = {}

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required.'
  } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  } else if (newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`
  } else if (currentPassword && newPassword === currentPassword) {
    errors.newPassword = CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.'
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function statusOf(error: unknown): unknown {
  return typeof error === 'object' && error !== null ? (error as { status?: unknown }).status : undefined
}

function bodyMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('data' in error)) return undefined
  const data = (error as { data?: unknown }).data
  if (typeof data !== 'object' || data === null) return undefined
  const message = (data as { message?: unknown }).message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message) && message.length > 0) return message.map(String).join(', ')
  return undefined
}

/**
 * Maps API failures to fixed, non-sensitive copy. Prefer known backend phrases
 * when present; never echo unexpected bodies.
 */
export function getChangePasswordErrorMessage(error: unknown): string {
  const status = statusOf(error)
  const message = bodyMessage(error)

  if (status === 401) {
    if (message === 'Invalid current password') return CHANGE_PASSWORD_WRONG_CURRENT_MESSAGE
    // Expired / missing access token after refresh failed, or a generic 401.
    return 'Your session has expired. Please sign in again and try changing your password.'
  }

  if (status === 400) {
    if (message === 'New password must be different from the current password') {
      return CHANGE_PASSWORD_SAME_PASSWORD_MESSAGE
    }
    return `Your new password was not accepted. Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters.`
  }

  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 429) {
    return getApiErrorMessage(error, "We couldn't change your password. Please try again.")
  }

  return "We couldn't change your password. Please try again."
}

export type ChangePasswordOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: ChangePasswordErrors }
  | { status: 'success' }
  | { status: 'error'; message: string }

/**
 * Validates, submits, and on success asks the caller to drop the revoked
 * refresh token. The user is not signed out: the access JWT remains valid.
 */
export async function submitChangePassword(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  send: SendMutation<ChangePasswordRequest>
  onRefreshRevoked: () => void
  guard: SubmitGuard
}): Promise<ChangePasswordOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateChangePasswordInput(
      input.currentPassword,
      input.newPassword,
      input.confirmPassword,
    )
    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      return { status: 'invalid', errors }
    }
    await input
      .send({ currentPassword: input.currentPassword, newPassword: input.newPassword })
      .unwrap()
    input.onRefreshRevoked()
    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: getChangePasswordErrorMessage(error) }
  } finally {
    input.guard.leave()
  }
}
