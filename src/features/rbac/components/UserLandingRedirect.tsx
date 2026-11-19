import { Navigate } from 'react-router-dom'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'

import { getUserLandingRoute } from '../utils/userRoles'

/** Redirects to the authenticated user's own landing route (or login). */
export function UserLandingRedirect() {
  const { user } = useAuthenticatedUser()
  const landing = user ? getUserLandingRoute(user) : null
  return <Navigate to={landing ?? '/'} replace />
}
