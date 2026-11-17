import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { LEADS_CARD_HEADER, LEADS_CARD_SHELL } from '../shared/leadsUi'
import { LeadsSectionIcon } from './LeadsSectionIcon'
import {
  OVERVIEW_CARD,
  OVERVIEW_CARD_BODY,
  OVERVIEW_CARD_HEADER,
  OVERVIEW_SUBTITLE,
  OVERVIEW_TITLE,
} from './leadsOverviewUi'

export function LeadsOverviewCard({
  title,
  subtitle,
  icon,
  children,
  className,
  variant = 'standard',
  iconVariant,
  headerExtra,
  bodyClassName,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  variant?: 'overview' | 'standard'
  iconVariant?: 'overview' | 'overview-amber' | 'legacy'
  headerExtra?: ReactNode
  bodyClassName?: string
}) {
  if (variant === 'overview') {
    const tileVariant = iconVariant ?? (icon ? 'overview' : 'legacy')
    return (
      <section className={cn(OVERVIEW_CARD, className)}>
        <header className={cn(OVERVIEW_CARD_HEADER, headerExtra ? 'justify-between' : '')}>
          <div className="flex min-w-0 items-start gap-3">
            {icon ? <LeadsSectionIcon icon={icon} variant={tileVariant} /> : null}
            <div className="min-w-0">
              <p className={OVERVIEW_TITLE}>{title}</p>
              {subtitle ? <p className={cn(OVERVIEW_SUBTITLE, 'mt-0.5')}>{subtitle}</p> : null}
            </div>
          </div>
          {headerExtra}
        </header>
        <div className={cn(OVERVIEW_CARD_BODY, bodyClassName)}>{children}</div>
      </section>
    )
  }

  return (
    <section className={cn(LEADS_CARD_SHELL, className)}>
      <header className={LEADS_CARD_HEADER}>
        <div className="flex items-start gap-2.5">
          {icon ? <LeadsSectionIcon icon={icon} /> : null}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-hrms-navy">{title}</p>
            {subtitle ? <p className="text-xs text-hrms-text-secondary">{subtitle}</p> : null}
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 p-4">{children}</div>
    </section>
  )
}