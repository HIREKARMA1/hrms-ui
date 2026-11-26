/**
 * Four-up stat cards with icon tiles and tone tints for leave tabs.
 * Tight margin below avoids a gap before filter rows.
 */

import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type LeaveStatTone = 'neutral' | 'primary' | 'warning' | 'success' | 'danger'

/** `number` = large metric; `text` = dates, ranges, or short phrases. */
export type LeaveStatValueVariant = 'number' | 'text'

export type LeaveStatItem = {
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  tone: LeaveStatTone
  valueVariant?: LeaveStatValueVariant
}

const toneTile: Record<LeaveStatTone, string> = {
  neutral: 'bg-hrms-muted-bg text-hrms-text-secondary',
  primary: 'bg-hrms-lavender text-hrms-primary',
  warning: 'bg-hrms-warning/10 text-hrms-warning',
  success: 'bg-hrms-success/10 text-hrms-success',
  danger: 'bg-hrms-danger/10 text-hrms-danger',
}

const valueStyles: Record<LeaveStatValueVariant, string> = {
  number: 'text-2xl font-bold tabular-nums tracking-tight text-hrms-navy',
  text: 'text-base font-semibold leading-snug text-hrms-navy',
}

type LeaveStatGridProps = {
  items: LeaveStatItem[]
  loading?: boolean
}

function LeaveStatGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading summary">
      {[0, 1, 2, 3].map((key) => (
        <Card key={key} className="rounded-2xl border-border-soft shadow-sm">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-hrms-muted-bg" />
              <div className="h-8 w-16 animate-pulse rounded bg-hrms-muted-bg" />
            </div>
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-hrms-muted-bg" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function LeaveStatGrid({ items, loading = false }: LeaveStatGridProps) {
  if (loading) {
    return <LeaveStatGridSkeleton />
  }

  const colClass = items.length < 4 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', colClass)}>
      {items.slice(0, 4).map((item) => {
        const Icon = item.icon
        const variant = item.valueVariant ?? 'number'
        return (
          <Card key={item.label} className="rounded-2xl border-border-soft bg-white shadow-sm">
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-hrms-text-secondary">{item.label}</p>
                <p className={cn('mt-2', valueStyles[variant])}>{item.value}</p>
                {item.detail ? <p className="mt-1.5 text-xs leading-relaxed text-hrms-text-secondary">{item.detail}</p> : null}
              </div>
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneTile[item.tone])}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}