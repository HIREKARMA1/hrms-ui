/**
 * Stat cards shared across variable pay and settlement tabs.
 * Mirrors Overview SummaryCards icon tile pattern with tone tints.
 */

import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type PayrollStatTone = 'neutral' | 'primary' | 'warning' | 'success' | 'danger'

export type PayrollStatItem = {
  label: string
  value: string
  icon: LucideIcon
  tone: PayrollStatTone
}

const toneTile: Record<PayrollStatTone, string> = {
  neutral: 'bg-hrms-muted-bg text-hrms-text-secondary',
  primary: 'bg-hrms-lavender text-hrms-primary',
  warning: 'bg-hrms-warning/10 text-hrms-warning',
  success: 'bg-hrms-success/10 text-hrms-success',
  danger: 'bg-hrms-danger/10 text-hrms-danger',
}

type PayrollStatGridProps = {
  items: PayrollStatItem[]
}

export function PayrollStatGrid({ items }: PayrollStatGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-hrms-text-secondary">{item.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-hrms-navy">{item.value}</p>
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  toneTile[item.tone],
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
