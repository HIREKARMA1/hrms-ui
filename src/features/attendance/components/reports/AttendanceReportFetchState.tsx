/**
 * Range validation, loading, and API error display for attendance reports.
 */
import { AlertCircle, Loader2 } from 'lucide-react'

import { getApiErrorMessage } from '@/services/api/errors'

type AttendanceReportFetchStateProps = {
  rangeError: string | null
  isLoading: boolean
  isError: boolean
  error: unknown
  loadingMessage: string
  errorFallback: string
  placeholder?: string | null
}

export function AttendanceReportFetchState({
  rangeError,
  isLoading,
  isError,
  error,
  loadingMessage,
  errorFallback,
  placeholder,
}: AttendanceReportFetchStateProps) {
  return (
    <>
      {rangeError ? <p className="text-sm text-amber-700">{rangeError}</p> : null}
      {placeholder ? <p className="text-sm text-text-secondary">{placeholder}</p> : null}
      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingMessage}
        </p>
      ) : null}
      {isError ? (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-text-secondary">{getApiErrorMessage(error, errorFallback)}</p>
        </div>
      ) : null}
    </>
  )
}