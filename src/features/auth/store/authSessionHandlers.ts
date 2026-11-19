import type { UnknownAction } from '@reduxjs/toolkit'

import type { AuthSessionHandlers } from '@/services/api/baseApi'

import { resolveRefreshedUser } from '../utils/authUser'
import { clearCredentials, setCredentials, type AuthState } from './authSlice'

type AuthStoreApi = {
  getState: () => { auth: AuthState }
  dispatch: (action: UnknownAction) => unknown
}

/**
 * Session callbacks for `baseApi` (token refresh / dead session).
 * Rotated tokens keep `rememberMe`; the user is only replaced by a complete
 * user for the same account (see `resolveRefreshedUser`).
 */
export function createAuthSessionHandlers(
  store: AuthStoreApi,
  { onExpired }: { onExpired: () => void },
): AuthSessionHandlers {
  return {
    onTokensRefreshed: (session) => {
      const { user: currentUser, rememberMe } = store.getState().auth
      const user = resolveRefreshedUser(currentUser, session.user)
      if (!user) return false
      store.dispatch(
        setCredentials({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user,
          rememberMe,
        }),
      )
      return true
    },
    onSessionExpired: () => {
      store.dispatch(clearCredentials())
      onExpired()
    },
  }
}
