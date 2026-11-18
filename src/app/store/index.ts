import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import {
  clearStoredAuth,
  saveStoredAuth,
} from '@/features/auth/utils/authStorage'
import { baseApi } from '@/services/api/baseApi'

import { rootReducer } from './rootReducer'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

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
