import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { createAuthSessionHandlers } from '@/features/auth/store/authSessionHandlers'
import {
  clearStoredAuth,
  saveStoredAuth,
} from '@/features/auth/utils/authStorage'
import { redirectToLogin } from '@/features/auth/utils/sessionRedirect'
import { baseApi, registerAuthSessionHandlers } from '@/services/api/baseApi'

import { rootReducer } from './rootReducer'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

// Token refresh (see baseApi): rotated tokens go through the existing
// `setCredentials` action (rememberMe is preserved) and the persistence
// subscriber below; a dead session clears state/storage and returns to login.
registerAuthSessionHandlers(
  createAuthSessionHandlers(store, {
    onExpired: () => {
      clearStoredAuth()
      redirectToLogin()
    },
  }),
)

// Persist the auth slice (only when it actually changes).
let previousAuth = store.getState().auth
store.subscribe(() => {
  const auth = store.getState().auth
  if (auth === previousAuth) return
  previousAuth = auth

  if (auth.accessToken && auth.refreshToken && auth.user) {
    saveStoredAuth({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      user: auth.user,
      rememberMe: auth.rememberMe,
    })
  } else {
    clearStoredAuth()
  }
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
