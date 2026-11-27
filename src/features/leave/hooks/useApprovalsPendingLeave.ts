import { useMemo } from 'react'

import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth/store/authSlice'

import { useGetPendingApprovalsQuery } from '../api/leaveApprovalApi'
import { WORKFLOW_QUEUE_NO_EMPLOYEE_LINK_MESSAGE } from '../constants/workflowApproverQueueMessages'
import type { LeaveRequest } from '../types/leaveRequest'
import { isPendingEmployeeLinkError, pendingApprovalQueueErrorMessage } from '../utils/pendingApprovalQueueError'
import { useLeavePermissions } from './useLeavePermissions'
import { useShouldFetchLeaveList } from './useShouldFetchLeaveList'

/** Workflow approver queue (GET /leave-approval/pending); demo mock only when the API is skipped or not in server mode. */
export function useApprovalsPendingLeave(mockRows: LeaveRequest[]) {
  const { canApprove } = useLeavePermissions()
  const mayUseLeaveApi = useShouldFetchLeaveList()
  const user = useAppSelector(selectCurrentUser)
  const linkedEmployeeId = user?.employeeId?.trim() ?? ''
  const skippedNoEmployeeLink = Boolean(mayUseLeaveApi && canApprove && !linkedEmployeeId)
  const canFetch = mayUseLeaveApi && canApprove && Boolean(linkedEmployeeId)
  const { data, isError, error, isFetching, refetch } = useGetPendingApprovalsQuery(undefined, {
    skip: !canFetch,
  })

  const blockingError = Boolean(canFetch && isError)
  const employeeLinkRequired = blockingError && isPendingEmployeeLinkError(error)

  const liveRows = useMemo(() => {
    if (!canFetch || !data || isError) return null
    return data
  }, [canFetch, data, isError])

  const fallback = 'Unable to load pending approvals from the server.'

  const errorMessage = blockingError ? pendingApprovalQueueErrorMessage(error, fallback) : null

  const rows = useMemo(() => {
    if (blockingError || skippedNoEmployeeLink) return []
    return liveRows ?? mockRows
  }, [blockingError, liveRows, mockRows, skippedNoEmployeeLink])

  return {
    rows,
    useLiveApi: liveRows !== null,
    isFetching: canFetch && isFetching,
    errorMessage,
    blockingError,
    employeeLinkRequired,
    skippedNoEmployeeLink,
    workflowQueueInfoMessage: skippedNoEmployeeLink ? WORKFLOW_QUEUE_NO_EMPLOYEE_LINK_MESSAGE : null,
    refetch: canFetch ? () => void refetch() : undefined,
  }
}