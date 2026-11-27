import { AlertCircle } from 'lucide-react'

import { OV_BTN_SECONDARY, OV_FOCUS } from './overviewVisual'
import { cn } from '@/lib/utils'

type Props = {
  message: string
  onRetry?: () => void
}

export function OverviewErrorAlert({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EF444440] bg-[#EF44440F] px-3.5 py-2.5"
    >
      <div className="flex min-w-0 items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden />
        <p className="text-[13px] text-[#17213A]">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          className={cn(OV_BTN_SECONDARY, 'h-[30px] px-3 text-xs', OV_FOCUS)}
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}