import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHeldRoleCodes } from '@/features/rbac/utils/userRoles'
import { expireSession } from '@/services/api/baseApi'

import { useAuthenticatedUser } from '../hooks/useAuthenticatedUser'
import { useSignOut } from '../hooks/useSignOut'
import { LOGIN_PATH } from '../utils/sessionRedirect'

/**
 * Route guard for every private route (role workspaces + legacy shared routes).
 *
 * Reads only the Redux auth state. Initial session validation is handled
 * once by SessionBootstrap, which blocks rendering until it settles, so this
 * guard never triggers API calls on navigation.
 *
 * UX/navigation protection only - the backend still authorizes every request.
 */
export function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthenticatedUser()
  const unusableSession = isAuthenticated && !user

  useEffect(() => {
    // Stored user lacks identity fields: end the session cleanly instead of
    // bouncing between the login page and this guard.
    if (unusableSession) expireSession()
  }, [unusableSession])

  if (!isAuthenticated) {
    return (
      <Navigate
        to={LOGIN_PATH}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  if (!user) {
    return (
      <div
        role="status"
        className="flex min-h-svh items-center justify-center bg-app-bg text-sm text-slate-600"
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-600" />
        Ending session...
      </div>
    )
  }

  if (!user.isActive) {
    return (
      <SessionBlocked
        title="Account inactive"
        description="Your account is inactive. Contact your administrator to restore access."
      />
    )
  }

  if (getHeldRoleCodes(user).length === 0) {
    return (
      <SessionBlocked
        title="Unsupported role"
        description="Your account role is not supported in this portal."
      />
    )
  }

  return <Outlet />
}

function SessionBlocked({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const { signOut, isSigningOut } = useSignOut()

  return (
    <div className="flex min-h-svh items-center justify-center bg-app-bg px-4">
      <Card className="w-full max-w-lg border-border-soft shadow-sm">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#EF4444]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={() => void signOut()}
            disabled={isSigningOut}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
