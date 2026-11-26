/**
 * Leave rows for apply-time overlap checks. API mode prefers GET /leaves/history/{employeeId}
 * (no year filter) so validation matches the server, not only the first GET /leaves page.
 */

import { useMemo } from 'react'

import { LEAVE_MAX_LIMIT, useGetLeaveHistoryQuery } from '../api/leaveApi'
import type { LeaveRequest } from '../types/leaveRequest'

export function useEmployeeLeaveRequestsForValidation(
  employeeId: string | undefined,
  apiMode: boolean,
  fetchEnabled: boolean,
  fallback: LeaveRequest[],
): LeaveRequest[] {
  const history = useGetLeaveHistoryQuery(
    { employeeId: employeeId ?? '', page: 1, limit: LEAVE_MAX_LIMIT },
    { skip: !apiMode || !fetchEnabled || !employeeId },
  )
  return useMemo(() => {
    if (!employeeId) return []
    if (!apiMode) {
      return fallback.filter((item) => item.employeeId === employeeId)
    }
    if (history.data?.items.length) {
      return history.data.items
    }
    return fallback.filter((item) => item.employeeId === employeeId)
  }, [apiMode, employeeId, fallback, history.data?.items])
}