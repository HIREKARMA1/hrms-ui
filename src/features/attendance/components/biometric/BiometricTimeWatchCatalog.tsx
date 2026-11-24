import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { TimeWatchDevice } from '@/features/biometric/types/api/biometricDevices.types'
import { getApiErrorMessage } from '@/services/api/errors'

type BiometricTimeWatchCatalogProps = {
  items: TimeWatchDevice[] | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  canOnboard: boolean
  onOnboard: (deviceCode: string) => void
  onRetry: () => void
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function catalogErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error) && error.status === 503) {
    return 'TimeWatch catalog is temporarily unavailable. You can still register devices with Add device. If this persists, check the HRMS → TimeWatch gateway on the server.'
  }
  return getApiErrorMessage(error, 'Could not load the TimeWatch device catalog.')
}

export function BiometricTimeWatchCatalog({
  items,
  isLoading,
  isFetching,
  isError,
  error,
  canOnboard,
  onOnboard,
  onRetry,
}: BiometricTimeWatchCatalogProps) {
  const showLoading = (isLoading || isFetching) && !items?.length && !isError

  if (showLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border-soft bg-app-bg p-3 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
        Loading TimeWatch catalog…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
        <div className="flex gap-2 text-sm text-amber-950">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p className="font-medium text-navy">TimeWatch catalog unavailable</p>
            <p className="text-text-secondary">{catalogErrorMessage(error)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={onRetry}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Try again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!items?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-border-soft bg-app-bg p-3">
      <p className="text-sm font-medium text-navy">TimeWatch catalog (read-only)</p>
      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
        {items.slice(0, 8).map((row) => (
          <li key={row.deviceCode} className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{row.deviceCode}</span>
            {row.deviceName ? <span>— {row.deviceName}</span> : null}
            {canOnboard ? (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => onOnboard(row.deviceCode)}
              >
                Onboard
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}