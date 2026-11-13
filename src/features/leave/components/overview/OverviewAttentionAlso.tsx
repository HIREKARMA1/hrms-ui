/**
 * "Also needs attention" side list in the Overview attention section.
 */

import { useState } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'

import type { AttentionOtherItem, AttentionSummary } from '../../utils/buildAttentionSummary'
import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { OverviewRunAccrualDialog } from './OverviewRunAccrualDialog'

const TILE: Record<AttentionOtherItem['urgency'], string> = {
  warning: 'bg-hrms-warning/10 text-hrms-warning',
  info: 'bg-hrms-info/10 text-hrms-info',
}

type Props = { summary: AttentionSummary; onNavigate: HrOverviewNavigate }

export function OverviewAttentionAlso({ summary, onNavigate }: Props) {
  const [accrualOpen, setAccrualOpen] = useState(false)
  if (summary.otherItems.length === 0) {
    return (
      <article className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-hrms-border bg-white p-5 text-sm text-hrms-text-secondary">
        <CheckCircle2 className="h-8 w-8 text-hrms-success" aria-hidden />
        Everything else is up to date
      </article>
    )
  }
  return (
    <article className="flex h-full flex-col rounded-xl border border-hrms-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-hrms-navy">Also needs attention</h3>
      <ul className="space-y-1">
        {summary.otherItems.map((item) => {
          const Icon = item.icon
          const open = () => (item.key === 'acc' && item.actionLabel ? setAccrualOpen(true) : onNavigate(item.tab, item.opts))
          return (
            <li key={item.key}>
              <div
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    open()
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-1 py-2 hover:bg-hrms-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TILE[item.urgency])}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="min-w-0 flex-1 text-sm text-hrms-navy">
                  <span className="font-bold tabular-nums">{item.count}</span> <span className="text-hrms-text-secondary">{item.sentence}</span>
                </p>
                {item.actionLabel ? (
                  <Button type="button" size="sm" variant="ghost" className="h-8 shrink-0 text-hrms-primary" onClick={(event) => { event.stopPropagation(); setAccrualOpen(true) }}>
                    {item.actionLabel}
                  </Button>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-hrms-text-muted" aria-hidden />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <OverviewRunAccrualDialog open={accrualOpen} onOpenChange={setAccrualOpen} />
    </article>
  )
}
