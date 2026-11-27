import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { DASH_CARD } from './dashboardUi'

export type DashboardStatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  loading?: boolean
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
}: DashboardStatCardProps) {
  return (
    <div className={cn(DASH_CARD, 'p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#667085]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#17213A]">
            {loading ? '—' : value}
          </p>
          {hint ? <p className="mt-2 text-xs text-[#667085]">{hint}</p> : null}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
          <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
