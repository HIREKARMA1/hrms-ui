import { useEffect, useState, type ReactNode } from 'react'
import { useStore } from 'react-redux'
import { Loader2, TriangleAlert } from 'lucide-react'

import type { RootState } from '@/app/store'
import { useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { expireSession } from '@/services/api/baseApi'

import { useGetCurrentUserQuery } from '../api/authApi'
import { useSignOut } from '../hooks/useSignOut'
import { selectIsAuthenticated } from '../store/authSlice'
import {
  getSessionCheckErrorMessage,
  isUnusableSessionError,
} from '../utils/sessionCheck'

/**
 * Validates a *stored* session once at application start.
 *
 * - No stored session: renders children immediately, `/auth/me` is never called.
 * - Stored session: calls `GET /auth/me` (the base query transparently refreshes
 *   an expired access token and retries) and blocks the app behind a loading
 *   state until it settles, so nothing authenticated is shown unvalidated.
 * - Validation is a one-time startup concern: a later login (which already
 *   returns the user) or route changes never trigger it again.
 * - 401 that survives the refresh flow, or a token for a different account,
 *   ends the session; network errors, 5xx, 403, 304 and malformed responses
 *   keep the stored credentials and offer retry / sign out.
 */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const store = useStore<RootState>()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Decided once, on first render: only a session restored from storage is validated.
  const [hadStoredSession] = useState(() =>
    selectIsAuthenticated(store.getState()),
  )
  // Latches when validation succeeded or the session ended before it finished.
  const [settled, setSettled] = useState(!hadStoredSession)

  const { isSuccess, isError, error, refetch, isFetching } =
    useGetCurrentUserQuery(undefined, {
      skip: settled || !isAuthenticated,
    })

  // Latch (state adjusted during render, per React docs).
  if (!settled && (isSuccess || !isAuthenticated)) setSettled(true)

  const unusable = isError && isUnusableSessionError(error)
  useEffect(() => {
    // Refresh already failed -> Stage 1 cleared the session (then this is a
    // no-op because isAuthenticated is false). A 401 that persists after a
    // successful refresh, or a token for another account, is also unusable.
    if (unusable && isAuthenticated) expireSession()
  }, [unusable, isAuthenticated])

  const validated = settled || isSuccess
  if (!hadStoredSession || validated || !isAuthenticated) {
    return <>{children}</>
  }

  if (isError && !unusable) {
    return (
      <SessionCheckError
        message={getSessionCheckErrorMessage(error)}
        retrying={isFetching}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh items-center justify-center bg-[#f5f6fb]"
    >
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        Verifying your session...
      </div>
    </div>
  )
}

function SessionCheckError({
  message,
  retrying,
  onRetry,
}: {
  message: string
  retrying: boolean
  onRetry: () => void
}) {
  const { signOut, isSigningOut } = useSignOut()

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5f6fb] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TriangleAlert className="h-5 w-5 text-amber-500" />
            Unable to verify your session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p role="alert" className="text-sm text-slate-600">
            {message}
          </p>
          <div className="flex gap-2">
            <Button onClick={onRetry} disabled={retrying || isSigningOut}>
              {retrying ? 'Retrying...' : 'Try again'}
            </Button>
            <Button
              variant="outline"
              onClick={() => void signOut()}
              disabled={retrying || isSigningOut}
            >
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
