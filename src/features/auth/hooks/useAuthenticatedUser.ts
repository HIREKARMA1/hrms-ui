import { useMemo } from 'react'

import { useAppSelector } from '@/app/store/hooks'

import { selectCurrentUser, selectIsAuthenticated } from '../store/authSlice'
import { normalizeAuthUser } from '../utils/authUser'

/**
 * The signed-in user from Redux (normalized), or null when signed out or the
 * stored user is unusable. Redux is the only source - never browser storage.
 */
export function useAuthenticatedUser() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const rawUser = useAppSelector(selectCurrentUser)
  const user = useMemo(() => normalizeAuthUser(rawUser), [rawUser])

  return { isAuthenticated, user }
}
