/**
 * Leave snapshot with loading and error state for LeaveProvider.
 * Signed-in users get server data (useLeaveApiSnapshot); the in-memory demo
 * store is only used on unauthenticated demo routes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveRequestsQuery } from '../api/leaveApi'
import type { LeaveSnapshot } from '../services/leaveService'
import { fetchLeaveSnapshot } from '../services/leaveService'

export function useLeaveProviderState() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<LeaveSnapshot | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
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
  }, [])

  useEffect(() => {
    if (!enabled) return
    const handle = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [reload])

  return { loading, error, snapshot, reload }
}
