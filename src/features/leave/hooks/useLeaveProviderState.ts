/**
 * Loads leave snapshot from leaveService with loading and error state.
 * Merges GET /leaves when the viewer has `leaves:read`.
 * Used by LeaveProvider on LeavePage mount and after mutations.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveRequestsQuery } from '../api/leaveApi'
import type { LeaveSnapshot } from '../services/leaveService'
import { fetchLeaveSnapshot } from '../services/leaveService'
import { mapApiLeaveListToRequests } from '../utils/mapApiLeaveRequest'
import { useShouldFetchLeaveList } from './useShouldFetchLeaveList'

export function useLeaveProviderState() {
  const shouldFetchLeaves = useShouldFetchLeaveList()
  const {
    data: leaveList,
    isLoading: leaveListLoading,
    isError: leaveListIsError,
    error: leaveListError,
    refetch: refetchLeaveList,
  } = useGetLeaveRequestsQuery(undefined, { skip: !shouldFetchLeaves })

  const [mockLoading, setMockLoading] = useState(true)
  const [mockError, setMockError] = useState<string | null>(null)
  const [mockBase, setMockBase] = useState<LeaveSnapshot | null>(null)

  const reload = useCallback(async () => {
    setMockLoading(true)
    setMockError(null)
    try {
      const data = await fetchLeaveSnapshot()
      setMockBase(data)
    } catch {
      setMockError('Could not load leave data.')
      setMockBase(null)
    } finally {
      setMockLoading(false)
    }
    if (shouldFetchLeaves) {
      await refetchLeaveList()
    }
  }, [shouldFetchLeaves, refetchLeaveList])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [reload])

  const apiPending = shouldFetchLeaves && leaveListLoading
  const loading = mockLoading || apiPending

  const leaveListErrorMessage =
    shouldFetchLeaves && leaveListIsError
      ? getApiErrorMessage(
          leaveListError,
          'Could not load leave requests. Please try again.',
        )
      : null

  const error = mockError ?? leaveListErrorMessage

  const snapshot = useMemo((): LeaveSnapshot | null => {
    if (loading || !mockBase) return null

    if (!shouldFetchLeaves) {
      return { ...mockBase, requestsSource: 'mock' }
    }

    if (leaveListIsError) {
      return {
        ...mockBase,
        requests: [],
        requestsSource: 'api',
      }
    }

    if (leaveList) {
      return {
        ...mockBase,
        requests: mapApiLeaveListToRequests(leaveList),
        requestsSource: 'api',
      }
    }

    return { ...mockBase, requestsSource: 'api' }
  }, [
    loading,
    mockBase,
    shouldFetchLeaves,
    leaveListIsError,
    leaveList,
  ])

  return { loading, error, snapshot, reload }
}