import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import type { RootState } from '@/app/store'
import { baseApi, EMPTY_RESPONSE_ERROR } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
  ResetPasswordRequest,
} from '../types/auth.types'
import { parseCurrentUserResponse, parseLoginResponse } from '../utils/authUser'

const LOGOUT_TIMEOUT_MS = 10_000
const CURRENT_USER_TIMEOUT_MS = 15_000
/** Argon2 hashing makes reset-password slower than most calls. */
const PASSWORD_RESET_TIMEOUT_MS = 30_000

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
     * POST /auth/forgot-password (public). The server always answers the same
     * generic 200 `{ success, message, data: null }` whether or not the email
     * belongs to an account, so any 2xx is success and the body is ignored.
     * Dispatch with `{ track: false }` so the request is not kept in the store.
     */
    forgotPassword: build.mutation<null, ForgotPasswordRequest>({
      query: ({ email }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email: email.trim() },
        timeout: PASSWORD_RESET_TIMEOUT_MS,
      }),
      transformResponse: () => null,
    }),

    /**
     * POST /auth/reset-password (public). Success is a 200 with `data: null`;
     * an invalid, expired or already-used token is a 401. Dispatch with
     * `{ track: false }` so the token and password are not kept in the store.
     */
    resetPassword: build.mutation<null, ResetPasswordRequest>({
      query: ({ token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
        timeout: PASSWORD_RESET_TIMEOUT_MS,
      }),
      transformResponse: () => null,
    }),

    /**
     * GET /auth/me. The shared base query fetches with `cache: 'no-store'`, so
     * the browser never revalidates it into an empty 304. Only a complete
     * `{ success, data: { user } }` for the stored account resolves; a 304,
     * empty or malformed body is an error, so the auth slice never treats the
     * stored user as re-verified. 401 refresh-and-retry still applies.
     */
    getCurrentUser: build.query<AuthUser, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/auth/me',
          timeout: CURRENT_USER_TIMEOUT_MS,
        })
        if (result.error) {
          if (result.error.status === 304) return { error: authResponseError(AUTH_RESPONSE_ERRORS.notModified) }
          if (result.error.status === 'CUSTOM_ERROR' && result.error.error === EMPTY_RESPONSE_ERROR) {
            return { error: authResponseError(AUTH_RESPONSE_ERRORS.invalidResponse) }
          }
          return { error: result.error }
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
