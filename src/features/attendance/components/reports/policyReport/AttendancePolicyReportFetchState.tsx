/**
 * Loading / error / hint states for Attendance Reports (policy) page styling.
 */
import { AlertCircle, Loader2 } from 'lucide-react'

import { getApiErrorMessage } from '@/services/api/errors'

import { policyCardClass, policySecondaryText } from './attendancePolicyReportUi'

type AttendancePolicyReportFetchStateProps = {
  rangeError: string | null
  isLoading: boolean
  isError: boolean
  error: unknown
  loadingMessage: string
  errorFallback: string
  placeholder?: string | null
}

export function AttendancePolicyReportFetchState({
  rangeError,
  isLoading,
  isError,
  error,
  loadingMessage,
  errorFallback,
  placeholder,
}: AttendancePolicyReportFetchStateProps) {
  return (
    <div className="space-y-3">
      {rangeError ? (
        <div className={`${policyCardClass} border-[#FEF3DC] bg-[#FEF3DC] px-4 py-3 text-sm text-[#B45309]`}>
          {rangeError}
        </div>
      ) : null}
      {placeholder ? <p className={`text-sm ${policySecondaryText}`}>{placeholder}</p> : null}
      {isLoading ? (
        <div className={`${policyCardClass} flex items-center gap-2 px-[22px] py-4 text-sm ${policySecondaryText}`}>
          <Loader2 className="h-4 w-4 animate-spin text-[#0F766E]" aria-hidden />
          {loadingMessage}
        </div>
      ) : null}
      {isError ? (
        <div
          className={`${policyCardClass} flex gap-2 border-[#FDEAEA] bg-[#FDEAEA] px-4 py-3 text-sm text-[#17213A]`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden />
          <p className={policySecondaryText}>{getApiErrorMessage(error, errorFallback)}</p>
        </div>
      ) : null}
    </div>
  )
}