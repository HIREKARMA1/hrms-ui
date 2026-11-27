import { useMemo } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { LEAVE_MAX_LIMIT, useListLeavesQuery } from '../api/leaveApi'
import { mergeLeaveEmployees } from '../api/leaveMappers'
import type { LeaveSnapshot } from '../services/leaveService'
import { buildRecentActivity } from '../utils/buildRecentActivity'

/**
 * Recent overview activity: prefers a dedicated GET /leaves page in server mode,
 * otherwise falls back to the provider snapshot.
 */
export function useLeaveOverviewRecentActivity(options: {
  enabled: boolean
  snapshot: LeaveSnapshot | null
  limit?: number
}) {
  const { enabled, snapshot, limit = 8 } = options
  const orgWide = Boolean(snapshot?.api?.access.orgWideRequests)

  const list = useListLeavesQuery(
    { page: 1, limit: Math.min(25, LEAVE_MAX_LIMIT) },
    { skip: !enabled || !orgWide },
  )

  const activitySnapshot = useMemo((): LeaveSnapshot | null => {
    if (!snapshot) return null
    if (!enabled || !orgWide || !list.data) return snapshot
    return {
      ...snapshot,
      requests: list.data.items,
      employees: mergeLeaveEmployees(snapshot.employees, list.data.employees),
    }
  }, [enabled, list.data, orgWide, snapshot])

  const items = useMemo(
    () => (activitySnapshot ? buildRecentActivity(activitySnapshot, limit) : []),
    [activitySnapshot, limit],
  )

  const loading = enabled && orgWide && list.isLoading && !list.data
  const error =
    enabled && orgWide && list.isError
      ? getApiErrorMessage(list.error, 'Could not load recent leave activity.')
      : null

  const scopeNote =
    orgWide && list.data
      ? `Last ${limit} events from the ${list.data.items.length} most recent leave requests (page 1).`
      : snapshot?.api
        ? 'Last events from leave requests loaded for this session.'
        : 'Last eight events across leave requests and accruals.'

  return {
    items,
    loading,
    error,
    refetch: () => void list.refetch(),
    activitySnapshot,
    scopeNote,
    useDedicatedList: orgWide,
  }
}