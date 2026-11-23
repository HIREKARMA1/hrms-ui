import { useCallback, useState } from 'react'

const STORAGE_KEY = 'office-calendar-mock-banner-dismissed'

export function useDismissibleMockBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  return { dismissed, dismiss }
}