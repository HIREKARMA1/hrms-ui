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
  neutral: 'bg-[#EEF0F6] text-[#667085]',
  primary: 'bg-[#F0EDFF] text-[#5938DB]',
  warning: 'bg-[#F59E0B1F] text-[#F59E0B]',
  success: 'bg-[#16A34A1A] text-[#16A34A]',
  danger: 'bg-hrms-danger/10 text-hrms-danger',
}

const toneTileDefault: Record<LeaveStatTone, string> = {
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
  chrome?: 'default' | 'overview'
}

function LeaveStatGridSkeleton({ overview }: { overview?: boolean }) {
  const cardClass = overview
    ? 'rounded-[14px] border border-[#E2E6EF] bg-white shadow-none'
    : 'rounded-2xl border-border-soft shadow-sm'
  return (
    <div
      className={cn(
        'grid gap-4',
        overview ? 'grid-cols-1 min-[520px]:grid-cols-2 min-[980px]:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-4',
      )}
      aria-busy="true"
      aria-label="Loading summary"
    >
      {[0, 1, 2, 3].map((key) => (
        <Card key={key} className={cardClass}>
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-[#EEF0F6] motion-reduce:animate-none" />
              <div className="h-8 w-16 animate-pulse rounded bg-[#EEF0F6] motion-reduce:animate-none" />
            </div>
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-[10px] bg-[#EEF0F6] motion-reduce:animate-none" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function LeaveStatGrid({ items, loading = false, chrome = 'default' }: LeaveStatGridProps) {
  const overview = chrome === 'overview'

  if (loading) {
    return <LeaveStatGridSkeleton overview={overview} />
  }

  if (overview) {
    return (
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 min-[980px]:grid-cols-4">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.label}
              className="rounded-[14px] border border-[#E2E6EF] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-medium text-[#667085]">{item.label}</p>
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                    toneTile[item.tone],
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </div>
              </div>
              <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.02em] text-[#17213A] tabular-nums">
                {item.value}
              </p>
              {item.detail ? (
                <p className="mt-2 text-[12.5px] leading-snug text-[#98A2B3]">{item.detail}</p>
              ) : null}
            </article>
          )
        })}
      </div>
    )
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
                {item.detail ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-hrms-text-secondary">{item.detail}</p>
                ) : null}
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  toneTileDefault[item.tone],
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