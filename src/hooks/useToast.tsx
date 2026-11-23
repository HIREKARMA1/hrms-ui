import { useCallback, useEffect, useState } from 'react'

export function useToast(durationMs = 3200) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), durationMs)
    return () => window.clearTimeout(timer)
  }, [message, durationMs])

  const toast = useCallback((nextMessage: string) => {
    setMessage(nextMessage)
  }, [])

  return { message, toast }
}

export function ToastBanner({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-sm text-navy shadow-lg"
    >
      {message}
    </div>
  )
}
