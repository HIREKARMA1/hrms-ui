import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { authApi } from '../api/authApi'
import type { AuthUser } from '../types/auth.types'
import { loadStoredAuth } from '../utils/authStorage'

export type { AuthUser }

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  /** Where the session is persisted: localStorage (true) or sessionStorage (false). */
  rememberMe: boolean
}

const emptyState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  rememberMe: false,
}

function getInitialState(): AuthState {
  const stored = loadStoredAuth()
  return stored ? { ...stored } : emptyState
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        user: AuthUser
        rememberMe?: boolean
      }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.rememberMe = action.payload.rememberMe ?? state.rememberMe
    },
    clearCredentials() {
      return emptyState
    },
    /**
     * Drop the refresh token after the server has revoked it (e.g. change
     * password). The access token and user stay so the current session
     * continues until the access JWT expires.
     */
    clearRefreshToken(state) {
      state.refreshToken = null
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload, meta }) => {
        state.accessToken = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.user = payload.user
        state.rememberMe = meta.arg.originalArgs.rememberMe === true
      },
    )

    // Sync the latest backend user from GET /auth/me. Only the user object is
    // written; tokens and rememberMe are untouched. A late response can never
    // restore an ended session (no tokens/user) or overwrite a different
    // account's session (id mismatch).
    builder.addMatcher(
      authApi.endpoints.getCurrentUser.matchFulfilled,
      (state, { payload }) => {
        if (!state.accessToken || !state.user) return
        if (state.user.id !== payload.id) return
        state.user = payload
      },
    )
  },
  selectors: {
    selectCurrentUser: (state) => state.user,
    selectAccessToken: (state) => state.accessToken,
    selectIsAuthenticated: (state) =>
      Boolean(state.accessToken && state.user),
  },
})

export const { setCredentials, clearCredentials, clearRefreshToken } = authSlice.actions
export const { selectCurrentUser, selectAccessToken, selectIsAuthenticated } =
  authSlice.selectors
export const authReducer = authSlice.reducer
