import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import type { ApiErrorBody } from './types'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

/**
 * Turn any RTK Query error into a user-facing message.
 * Handles Nest error bodies (`message` string or string[]) and network failures.
 */
export function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!isFetchBaseQueryError(error)) {
    return fallback
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Unable to reach the server. Check your connection and try again.'
  }
  if (error.status === 'PARSING_ERROR' || error.status === 'CUSTOM_ERROR') {
    return fallback
  }
  if (error.status === 'TIMEOUT_ERROR') {
    return 'The request timed out. Please try again.'
  }
  if (error.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  const body = error.data as ApiErrorBody | undefined
  const message = body?.message
  if (Array.isArray(message) && message.length > 0) return message.join(', ')
  if (typeof message === 'string' && message.trim()) return message

  return fallback
}
