/**
 * Loads leave snapshot from leaveService with loading and error state.
 * Used by LeaveProvider on LeavePage mount and after mutations.
 */

import { useCallback, useEffect, useState } from 'react'

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
      setSnapshot(data)
    } catch {
      setError('Could not load leave data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [reload])

  return { loading, error, snapshot, reload }
}
