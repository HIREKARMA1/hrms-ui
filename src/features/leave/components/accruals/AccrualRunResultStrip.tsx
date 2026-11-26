import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AccrualRunFeedback = { ok: boolean; message: string }

export function AccrualRunResultStrip({ feedback }: { feedback: AccrualRunFeedback }) {
  const Icon = feedback.ok ? CheckCircle2 : AlertCircle
  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
        feedback.ok
          ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-950'
          : 'border-amber-200 bg-amber-50 text-amber-950',
      )}
    >
      <div className="flex gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold text-[11px] uppercase tracking-wide opacity-80">
            {feedback.ok ? 'Last run' : 'Run failed'}
          </p>
          <p className="mt-0.5 text-sm font-medium text-inherit">{feedback.message}</p>
        </div>
      </div>
    </div>
  )
}