import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import type { RootState } from '@/app/store'
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AuthUser,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
} from '../types/auth.types'
import { parseCurrentUserResponse, parseLoginResponse } from '../utils/authUser'

const LOGOUT_TIMEOUT_MS = 10_000
const CURRENT_USER_TIMEOUT_MS = 15_000

/** `error` codes of the CUSTOM_ERROR results produced by this module. */
export const AUTH_RESPONSE_ERRORS = {
  /** GET /auth/me answered 304: no body, so nothing was verified. */
  notModified: 'AUTH_ME_NOT_MODIFIED',
  /** The response body is not the expected `{ success, data }` envelope. */
  invalidResponse: 'AUTH_INVALID_RESPONSE',
  /** /auth/me returned a different account than the stored session. */
  userMismatch: 'AUTH_USER_MISMATCH',
} as const

export type AuthResponseErrorCode =
  (typeof AUTH_RESPONSE_ERRORS)[keyof typeof AUTH_RESPONSE_ERRORS]

/** Response bodies are deliberately not attached: they may contain tokens. */
function authResponseError(code: AuthResponseErrorCode): FetchBaseQueryError {
  return { status: 'CUSTOM_ERROR', error: code }
}

export function isAuthResponseError(error: unknown, code: AuthResponseErrorCode): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { status?: unknown }).status === 'CUSTOM_ERROR' &&
    (error as { error?: unknown }).error === code
  )
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** POST /auth/login. `rememberMe` is client-only and is not sent. */
    login: build.mutation<LoginResponseData, LoginRequest>({
      async queryFn({ email, password }, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/auth/login',
          method: 'POST',
          body: { email, password },
        })
        if (result.error) return { error: result.error }
        const session = parseLoginResponse(result.data)
        return session
          ? { data: session }
          : { error: authResponseError(AUTH_RESPONSE_ERRORS.invalidResponse) }
      },
    }),

    /**
     * POST /auth/logout (Bearer access token). Revokes the refresh token
     * server-side. Local session clearing is handled by `useSignOut`, not here,
     * so it still happens when this request fails.
     */
    logout: build.mutation<null, LogoutRequest>({
      query: ({ refreshToken }) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { refreshToken },
        // Never leave the user stuck on "signing out" if the server hangs.
        timeout: LOGOUT_TIMEOUT_MS,
      }),
      transformResponse: (response: ApiResponse<null>) => unwrapData(response),
    }),

    /**
     * GET /auth/me. Fetched with `cache: 'no-store'` so the browser never
     * revalidates it into an empty 304. Only a complete `{ success, data: { user } }`
     * for the stored account resolves; a 304, empty or malformed body is an
     * error, so the auth slice never treats the stored user as re-verified.
     * Goes through the shared base query, so 401 refresh-and-retry still applies.
     */
    getCurrentUser: build.query<AuthUser, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/auth/me',
          timeout: CURRENT_USER_TIMEOUT_MS,
          cache: 'no-store',
        })
        if (result.error) {
          return {
            error:
              result.error.status === 304
                ? authResponseError(AUTH_RESPONSE_ERRORS.notModified)
                : result.error,
          }
        }
        const user = parseCurrentUserResponse(result.data)
        if (!user) return { error: authResponseError(AUTH_RESPONSE_ERRORS.invalidResponse) }
        const stored = (api.getState() as RootState).auth.user
        if (stored && stored.id !== user.id) {
          return { error: authResponseError(AUTH_RESPONSE_ERRORS.userMismatch) }
        }
        return { data: user }
      },
      // Never reuse a previous verification result for a later mount.
      keepUnusedDataFor: 0,
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi
