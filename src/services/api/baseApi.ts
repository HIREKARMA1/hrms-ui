/**
 * Root RTK Query API.
 *
 * Feature convention: each module adds its endpoints in
 * `features/<name>/api/<name>Api.ts` via `baseApi.injectEndpoints({ ... })`
 * and exports the generated hooks (e.g. `useGetXQuery`, `useCreateXMutation`).
 * Unwrap the server envelope with `transformResponse: unwrapData`.
 *
 * Requests never use the browser HTTP cache (`cache: 'no-store'` below);
 * RTK Query's in-memory cache and tag invalidation handle reuse.
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

/**
 * Every request bypasses the browser HTTP cache: authenticated responses are
 * never stored on disk or revalidated by the browser into a 304, and the cache
 * key (URL only) cannot hand one account's data to another. This is a fetch
 * cache mode, not a `Cache-Control` request header, so it adds no CORS
 * preflight header. RTK Query's in-memory cache is unaffected. A request may
 * still override it via its own `cache` option.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  cache: 'no-store',
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
/**
 * Endpoints whose 401 is a real answer (bad credentials / dead refresh token /
 * invalid reset token), never a reason to refresh.
 */
const NO_REAUTH_URLS = [
  '/auth/login',
  REFRESH_URL,
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
]

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

/** `error` code of the CUSTOM_ERROR returned for a successful GET without a body. */
export const EMPTY_RESPONSE_ERROR = 'EMPTY_RESPONSE'

function isGetRequest(args: string | FetchArgs): boolean {
  return typeof args === 'string' || !args.method || args.method.toUpperCase() === 'GET'
}

/**
 * Every API GET answers with a JSON body, so a 2xx GET with an empty body is
 * an error, never data an endpoint could unwrap. Non-2xx statuses (304
 * included) already fail `fetchBaseQuery`'s 2xx `validateStatus`. Empty
 * bodies on other methods (e.g. 204 from DELETE) pass through.
 */
function rejectEmptyGet(
  args: string | FetchArgs,
  result: Awaited<ReturnType<typeof baseQueryWithRefresh>>,
): Awaited<ReturnType<typeof baseQueryWithRefresh>> {
  if (result.error || !isGetRequest(args)) return result
  if (result.data !== null && result.data !== undefined) return result
  return { error: { status: 'CUSTOM_ERROR', error: EMPTY_RESPONSE_ERROR }, meta: result.meta }
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
const baseQueryWithRefresh: BaseQueryFn<
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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) =>
  rejectEmptyGet(args, await baseQueryWithRefresh(args, api, extraOptions))

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: API_TAGS,
  endpoints: () => ({}),
})
