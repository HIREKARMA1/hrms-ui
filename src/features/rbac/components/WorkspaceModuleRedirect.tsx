import { Navigate } from 'react-router-dom'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'

import { getWorkspaceModulePath } from '../utils/workspaces'

type WorkspaceModuleRedirectProps = {
  /** Module segment under the workspace prefix, e.g. `leads`. */
  section: string
}

/**
 * Redirects a legacy un-prefixed module URL to the same module inside the
 * authenticated user's own workspace. The target route's feature guard still
 * decides access.
 */
export function WorkspaceModuleRedirect({ section }: WorkspaceModuleRedirectProps) {
  const { user } = useAuthenticatedUser()
  const target = user ? getWorkspaceModulePath(user, section) : null
  return <Navigate to={target ?? '/'} replace />
}
