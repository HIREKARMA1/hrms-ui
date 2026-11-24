import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import type { UnsupportedChange } from '../api/employeeMappers'

type Tone = 'info' | 'success' | 'warning' | 'error'

const TONES: Record<Tone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

export function EmployeeNotice({
  tone,
  children,
  className,
}: {
  tone: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl border px-4 py-2.5 text-sm', TONES[tone], className)}
    >
      {children}
    </div>
  )
}

/** Lists user-entered fields the server could not store (kept on screen only). */
export function UnsupportedFieldsNotice({ changes }: { changes: UnsupportedChange[] }) {
  if (changes.length === 0) return null
  const labels = [...new Set(changes.map((change) => change.label))]
  return (
    <EmployeeNotice tone="warning">
      Not saved to the server (no backend field yet), kept on this screen only:{' '}
      {labels.join(', ')}.
    </EmployeeNotice>
  )
}
