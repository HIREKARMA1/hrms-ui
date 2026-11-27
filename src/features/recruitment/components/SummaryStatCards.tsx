import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { RECRUITMENT_CARD } from './shared/recruitmentUi'

export type SummaryStat = {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: string
}

export function SummaryStatCards({ stats }: { stats: SummaryStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className={cn(RECRUITMENT_CARD, 'shadow-none')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]',
                  stat.accent,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[#667085]">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums text-[#17213A]">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
