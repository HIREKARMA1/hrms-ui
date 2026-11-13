import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
          <Card key={stat.label} className="border-border-soft shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500',
                  stat.accent,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums text-navy">
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
