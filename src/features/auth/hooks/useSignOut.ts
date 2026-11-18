import { useCallback } from 'react'
import { useStore } from 'react-redux'

import type { RootState } from '@/app/store'
import { useAppDispatch } from '@/app/store/hooks'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { useLogoutMutation } from '../api/authApi'
import { clearCredentials } from '../store/authSlice'
import { clearStoredAuth } from '../utils/authStorage'
import { redirectToLogin } from '../utils/sessionRedirect'

/** Shared by every consumer so a double click / two menus cannot send two logouts. */
let signOutInFlight: Promise<void> | null = null

/**
 * Sign the current user out.
 *
 * 1. Calls POST /auth/logout with the current refresh token (best effort).
 * 2. Always clears Redux auth state + persisted auth, even if step 1 fails
 *    (network error, 4xx/5xx, timeout) - the user is never left signed in.
 * 3. Redirects to the login route.
 *
 * While signing out, token refresh is blocked and a refresh that finishes
 * afterwards is discarded (see `baseApi`), so nothing can restore the session.
 */
export function useSignOut() {
  const dispatch = useAppDispatch()
  const store = useStore<RootState>()
  const [logout, { isLoading }] = useLogoutMutation()

  const signOut = useCallback((): Promise<void> => {
    if (signOutInFlight) return signOutInFlight

    signOutInFlight = (async () => {
      setSessionEnding(true)
      try {
        const { refreshToken, accessToken } = store.getState().auth
        // Without a session there is nothing for the server to revoke.
        if (refreshToken && accessToken) {
          try {
            await logout({ refreshToken }).unwrap()
          } catch {
            // Graceful degradation: sign out locally regardless.
          }
        }
      } finally {
        dispatch(clearCredentials())
        clearStoredAuth()
        // Drop cached data belonging to the previous user.
        dispatch(baseApi.util.resetApiState())
        setSessionEnding(false)
        redirectToLogin()
      }
    })().finally(() => {
      // Attached after assignment so a synchronous completion cannot leave a
      // settled promise cached.
      signOutInFlight = null
    })

    return signOutInFlight
  }, [dispatch, logout, store])

  return { signOut, isSigningOut: isLoading }
}
