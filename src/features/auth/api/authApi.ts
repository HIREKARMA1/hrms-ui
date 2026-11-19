import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AuthUser,
  CurrentUserResponseData,
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
} from '../types/auth.types'

const LOGOUT_TIMEOUT_MS = 10_000
const CURRENT_USER_TIMEOUT_MS = 15_000

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** POST /auth/login. `rememberMe` is client-only and is not sent. */
    login: build.mutation<LoginResponseData, LoginRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
      transformResponse: (response: ApiResponse<LoginResponseData>) =>
        unwrapData(response),
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
     * GET /auth/me. The server nests the user under `data.user`, so the
     * envelope is unwrapped and then `user` is picked. The result is synced
     * into the auth slice (see `authSlice`); tokens are never touched.
     */
    getCurrentUser: build.query<AuthUser, void>({
      query: () => ({ url: '/auth/me', timeout: CURRENT_USER_TIMEOUT_MS }),
      transformResponse: (response: ApiResponse<CurrentUserResponseData>) =>
        unwrapData(response).user,
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi
