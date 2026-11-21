import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { BiometricConnectionTestResult } from '@/features/biometric/types/api/biometricSync.types'
import { getApiErrorMessage } from '@/services/api/errors'

type BiometricConnectionTestPanelProps = {
  data: BiometricConnectionTestResult | undefined
  isFetching: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function BiometricConnectionTestPanel({
  data,
  isFetching,
  isError,
  error,
  onRetry,
}: BiometricConnectionTestPanelProps) {
  if (isError) {
    const detail =
      isFetchBaseQueryError(error) && error.status === 503
        ? 'Gateway check could not reach TimeWatch. Verify server configuration and try again.'
        : getApiErrorMessage(error, 'Connection test request failed.')
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm">
        <div className="flex gap-2 text-amber-950">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p className="font-medium text-navy">Gateway check unavailable</p>
            <p className="text-text-secondary">{detail}</p>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onRetry} disabled={isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isFetching && !data?.steps.length) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Running gateway checks…
      </p>
    )
  }

  if (!data?.steps.length) {
    return (
      <p className="text-sm text-text-secondary">
        Use <strong className="font-medium text-navy">Test connection</strong> to verify HRMS can reach
        TimeWatch.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-border-soft bg-app-bg p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">Gateway checks</p>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={onRetry} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <ul className="mt-2 space-y-2">
        {data.steps.map((step) => (
          <li key={step.id} className="flex gap-2 text-sm">
            {step.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            )}
            <div>
              <span className="font-medium text-navy">{step.label}</span>
              {step.detail ? <p className="text-text-secondary">{step.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      {data.timewatchDevices?.length ? (
        <p className="mt-2 text-xs text-text-secondary">
          TimeWatch reported {data.timewatchDevices.length} device(s);{' '}
          {data.registeredDevices?.length ?? 0} registered in HRMS.
        </p>
      ) : null}
    </div>
  )
}