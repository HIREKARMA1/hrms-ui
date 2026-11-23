import { getApiErrorMessage } from '@/services/api/errors'

import { AUTH_RESPONSE_ERRORS, isAuthResponseError } from '../api/authApi'

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  )
}

/**
 * The stored session cannot be used: a 401 that survived the refresh flow, or
 * /auth/me answered for a different account than the one stored.
 */
export function isUnusableSessionError(error: unknown): boolean {
  return (
    isUnauthorized(error) ||
    isAuthResponseError(error, AUTH_RESPONSE_ERRORS.userMismatch)
  )
}

/** Message for recoverable verification failures (session kept, retry offered). */
export function getSessionCheckErrorMessage(error: unknown): string {
  if (
    isAuthResponseError(error, AUTH_RESPONSE_ERRORS.notModified) ||
    isAuthResponseError(error, AUTH_RESPONSE_ERRORS.invalidResponse)
  ) {
    return 'The server returned an unexpected session response. Please try again.'
  }
  return getApiErrorMessage(error, 'We could not verify your session. Please try again.')
}
