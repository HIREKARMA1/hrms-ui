/**
 * Server-backed leave snapshot for signed-in users. Each read only runs when
 * the caller's permissions (and employee link) allow it, so the screen never
 * fires requests the backend would reject.
 */

import { useCallback, useMemo } from 'react'

import { EMPLOYEE_MAX_TAKE, useListEmployeesQuery } from '@/features/employees/api/employeesApi'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import {
  LEAVE_MAX_LIMIT,
  getLeaveErrorMessage,
  useListEncashmentsQuery,
  useListLeavesQuery,
  useListLeaveTypesQuery,
} from '../api/leaveApi'
import { leaveEmployeeFromDirectory } from '../api/leaveMappers'
import { buildApiLeaveSnapshot, resolveLeaveApiAccess } from '../services/leaveApiSnapshot'
import type { LeaveSnapshot } from '../services/leaveService'

export type LeaveQueryState = {
  active: boolean
  hasData: boolean
  isError: boolean
  error?: unknown
}

/**
 * Loading until every active read has data or failed; the first failure
 * without data becomes the error. Inactive (skipped) reads never block.
 */
export function combineLeaveQueries(queries: LeaveQueryState[]): { loading: boolean; error: string | null } {
  const active = queries.filter((query) => query.active)
  const failed = active.find((query) => query.isError && !query.hasData)
  if (failed) return { loading: false, error: getLeaveErrorMessage(failed.error, 'Could not load leave data.') }
  return { loading: active.some((query) => !query.hasData), error: null }
}

const FIRST_PAGE = { page: 1, limit: LEAVE_MAX_LIMIT }

export function useLeaveApiSnapshot(enabled: boolean, linkedEmployeeId: string | null) {
  const { canAccess } = useOptionalFeatureAccess()
  const access = useMemo(() => resolveLeaveApiAccess(canAccess, linkedEmployeeId), [canAccess, linkedEmployeeId])

  const requests = useListLeavesQuery(FIRST_PAGE, { skip: !enabled || !access.requests })
  const leaveTypes = useListLeaveTypesQuery(FIRST_PAGE, { skip: !enabled || !access.leaveTypes })
  const encashments = useListEncashmentsQuery(FIRST_PAGE, { skip: !enabled || !access.encashments })
  const directory = useListEmployeesQuery(
    { skip: 0, take: EMPLOYEE_MAX_TAKE },
    { skip: !enabled || !access.employeeDirectory },
  )

  const { loading, error } = combineLeaveQueries([
    { active: enabled && access.requests, hasData: Boolean(requests.data), isError: requests.isError, error: requests.error },
    { active: enabled && access.leaveTypes, hasData: Boolean(leaveTypes.data), isError: leaveTypes.isError, error: leaveTypes.error },
    { active: enabled && access.encashments, hasData: Boolean(encashments.data), isError: encashments.isError, error: encashments.error },
    { active: enabled && access.employeeDirectory, hasData: Boolean(directory.data), isError: directory.isError, error: directory.error },
  ])

  const snapshot = useMemo<LeaveSnapshot | null>(() => {
    if (!enabled || loading || error) return null
    return buildApiLeaveSnapshot({
      access,
      requests: requests.data,
      leaveTypes: leaveTypes.data?.items,
      encashments: encashments.data,
      directory: directory.data?.items.map(leaveEmployeeFromDirectory),
    })
  }, [access, directory.data, enabled, encashments.data, error, leaveTypes.data, loading, requests.data])

  const { refetch: refetchRequests } = requests
  const { refetch: refetchTypes } = leaveTypes
  const { refetch: refetchEncashments } = encashments
  const { refetch: refetchDirectory } = directory

  const reload = useCallback(async () => {
    if (!enabled) return
    const pending: Promise<unknown>[] = []
    if (access.requests) pending.push(refetchRequests())
    if (access.leaveTypes) pending.push(refetchTypes())
    if (access.encashments) pending.push(refetchEncashments())
    if (access.employeeDirectory) pending.push(refetchDirectory())
    await Promise.allSettled(pending)
  }, [access, enabled, refetchDirectory, refetchEncashments, refetchRequests, refetchTypes])

  return { loading: enabled && loading, error: enabled ? error : null, snapshot, reload }
}
