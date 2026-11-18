/**
 * Root RTK Query API.
 *
 * Feature convention: each module adds its endpoints in
 * `features/<name>/api/<name>Api.ts` via `baseApi.injectEndpoints({ ... })`
 * and exports the generated hooks (e.g. `useGetXQuery`, `useCreateXMutation`).
 * Unwrap the server envelope with `transformResponse: unwrapData`.
 */
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { env } from '@/config/env'
import type { RootState } from '@/app/store'
import type { LoginResponseData } from '@/features/auth/types/auth.types'

import { API_TAGS } from './apiTags'
import type { ApiResponse } from './types'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/**
 * Auth session callbacks, registered once by the store (composition root).
 *
 * They are injected rather than imported because `authSlice` depends on
 * `authApi`, which depends on this file; importing the slice here would create
 * a circular module dependency.
 */
export interface AuthSessionHandlers {
  /** Persist rotated credentials (dispatches the existing `setCredentials`). Returns false if they could not be applied. */
  onTokensRefreshed: (session: LoginResponseData) => boolean
  /** Clear storage + Redux auth state and go to login. */
  onSessionExpired: () => void
}

let sessionHandlers: AuthSessionHandlers | null = null

export function registerAuthSessionHandlers(handlers: AuthSessionHandlers): void {
  sessionHandlers = handlers
}

/** End the local session (clear state + storage, go to login) via the store-registered handler. */
export function expireSession(): void {
  sessionHandlers?.onSessionExpired()
}

const REFRESH_URL = '/auth/refresh'
/** Endpoints whose 401 is a real answer (bad credentials / dead refresh token), never a reason to refresh. */
const NO_REAUTH_URLS = ['/auth/login', REFRESH_URL, '/auth/logout']

/**
 * True while a sign-out is in progress. Blocks token refresh so a late 401
 * cannot rotate tokens (or restore a session) while the user is leaving.
 */
let sessionEnding = false

export function setSessionEnding(value: boolean): void {
  sessionEnding = value
}

type RefreshOutcome =
  /** New tokens were stored. */
  | 'refreshed'
  /** Refresh was rejected/unusable: the session is dead. */
  | 'failed'
  /** Session changed (logout / new login) mid-refresh: result was discarded. */
  | 'superseded'

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

/**
 * Single in-flight refresh shared by every request that hits a 401.
 * The backend rotates refresh tokens (single use), so concurrent refreshes
 * would invalidate each other - this guarantees only one runs at a time.
 */
let refreshPromise: Promise<RefreshOutcome> | null = null

function refreshSession(
  api: BaseQueryApi,
  extraOptions: object,
): Promise<RefreshOutcome> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async (): Promise<RefreshOutcome> => {
    try {
      const refreshToken = (api.getState() as RootState).auth.refreshToken
      if (!refreshToken) return 'failed'

      // Goes straight to the raw query: the refresh call never enters the
      // reauth/retry logic below, so it cannot loop.
      const result = await rawBaseQuery(
        { url: REFRESH_URL, method: 'POST', body: { refreshToken } },
        api,
        extraOptions,
      )

      // The user may have signed out (or in as someone else) while the request
      // was in flight. Never write tokens from a stale session into the store.
      if (
        sessionEnding ||
        (api.getState() as RootState).auth.refreshToken !== refreshToken
      ) {
        return 'superseded'
      }

      const session = (result.data as ApiResponse<LoginResponseData> | undefined)
        ?.data
      if (
        result.error ||
        !session ||
        typeof session.accessToken !== 'string' ||
        typeof session.refreshToken !== 'string'
      ) {
        return 'failed'
      }

      return sessionHandlers?.onTokensRefreshed(session) ? 'refreshed' : 'failed'
    } catch {
      return 'failed'
    }
  })().finally(() => {
    // Attached after assignment so a synchronous early return cannot leave a
    // settled promise cached.
    refreshPromise = null
  })

  return refreshPromise
}

/**
 * fetchBaseQuery wrapper: on HTTP 401 from an authenticated request, refresh
 * the access token once (shared across concurrent requests) and retry the
 * original request exactly once. If refresh fails the session is cleared and
 * the original 401 is returned to every waiting request.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const tokenUsed = (api.getState() as RootState).auth.accessToken
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) return result
  if (NO_REAUTH_URLS.includes(getRequestUrl(args))) return result
  // Unauthenticated request (e.g. no session): nothing to refresh.
  if (!tokenUsed) return result
  // Signing out: do not refresh or retry.
  if (sessionEnding) return result

  const currentToken = (api.getState() as RootState).auth.accessToken
  // Another request already refreshed (or the session was cleared) while this
  // one was in flight. Never spend the rotated refresh token twice.
  if (currentToken !== tokenUsed) {
    return currentToken ? rawBaseQuery(args, api, extraOptions) : result
  }

  const outcome = await refreshSession(api, extraOptions ?? {})
  if (outcome === 'superseded') return result
  if (outcome === 'failed') {
    // Only one waiter needs to do this, but it is idempotent.
    if ((api.getState() as RootState).auth.accessToken) {
      sessionHandlers?.onSessionExpired()
    }
    return result
  }

  // Single retry; its outcome (even another 401) is returned as-is.
  return rawBaseQuery(args, api, extraOptions)
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: API_TAGS,
  endpoints: () => ({}),
})
