/**
 * Leave snapshot with loading and error state for LeaveProvider.
 * Signed-in users get server data (useLeaveApiSnapshot); the in-memory demo
 * store is only used on unauthenticated demo routes.
 */

import { useCallback, useEffect, useState } from 'react'

import type { LeaveSnapshot } from '../services/leaveService'
import { fetchLeaveSnapshot } from '../services/leaveService'
import { useLeaveApiSnapshot } from './useLeaveApiSnapshot'
import { useLeaveViewer } from './useLeaveViewer'

function useDemoLeaveState(enabled: boolean) {
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<LeaveSnapshot | null>(null)

  const reload = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      setSnapshot(await fetchLeaveSnapshot())
    } catch {
      setError('Could not load leave data.')
      setSnapshot(null)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const handle = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(handle)
  }, [enabled, reload])

  return { loading, error, snapshot, reload }
}

export function useLeaveProviderState() {
  const { viewer } = useLeaveViewer()
  const fromServer = viewer.source === 'authenticated'
  const demo = useDemoLeaveState(!fromServer)
  const api = useLeaveApiSnapshot(fromServer, viewer.employeeId)
  return fromServer ? api : demo
}
