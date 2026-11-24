import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export type ToastTone = 'default' | 'success' | 'error' | 'warning'

type ToastState = {
  message: string
  tone: ToastTone
} | null

export function useToast(durationMs = 4200) {
  const [toastState, setToastState] = useState<ToastState>(null)

  useEffect(() => {
    if (!toastState) return
    const timer = window.setTimeout(() => setToastState(null), durationMs)
    return () => window.clearTimeout(timer)
  }, [toastState, durationMs])

  const toast = useCallback((nextMessage: string, tone: ToastTone = 'default') => {
    setToastState({ message: nextMessage, tone })
  }, [])

  return {
    message: toastState?.message ?? null,
    tone: toastState?.tone ?? 'default',
    toast,
  }
}

export function ToastBanner({
  message,
  tone = 'default',
}: {
  message: string | null
  tone?: ToastTone
}) {
  if (!message) return null

  return (
    <div
      role="status"
      className={cn(
        'fixed bottom-6 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 rounded-xl border px-4 py-3 text-center text-sm shadow-lg',
        tone === 'error' && 'border-red-200 bg-red-50 text-red-900',
        tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-900',
        tone === 'default' && 'border-brand-200 bg-white text-navy',
      )}
    >
      {message}
    </div>
  )
}
