import { useMemo } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetPendingApprovalsQuery } from '../api/leaveApprovalApi'
import type { LeaveRequest } from '../types/leaveRequest'
import { useShouldFetchLeaveList } from './useShouldFetchLeaveList'

/** Admin Approvals leave segment: live pending queue with mock fallback. */
export function useApprovalsPendingLeave(mockRows: LeaveRequest[]) {
  const canFetch = useShouldFetchLeaveList()
  const { data, isError, error, isFetching } = useGetPendingApprovalsQuery(undefined, {
    skip: !canFetch,
  })

  const liveRows = useMemo(() => {
    if (!canFetch || !data || isError) return null
    return data
  }, [canFetch, data, isError])

  const errorMessage =
    canFetch && isError
      ? getApiErrorMessage(error, 'Unable to load pending approvals from the server. Showing demo queue.')
      : null

  return {
    rows: liveRows ?? mockRows,
    useLiveApi: liveRows !== null,
    isFetching: canFetch && isFetching,
    errorMessage,
  }
}