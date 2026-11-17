import type { LucideIcon } from 'lucide-react'

import { LEADS_SECTION_ICON_WRAP } from '../shared/leadsUi'
import { OVERVIEW_ICON_TILE, OVERVIEW_ICON_TILE_AMBER } from './leadsOverviewUi'

type LeadsSectionIconProps = {
  icon: LucideIcon
  variant?: 'overview' | 'overview-amber' | 'legacy'
}

export function LeadsSectionIcon({ icon: Icon, variant = 'legacy' }: LeadsSectionIconProps) {
  if (variant === 'overview') {
    return (
      <span className={OVERVIEW_ICON_TILE} aria-hidden>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
    )
  }
  if (variant === 'overview-amber') {
    return (
      <span className={OVERVIEW_ICON_TILE_AMBER} aria-hidden>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
    )
  }
  return (
    <span className={LEADS_SECTION_ICON_WRAP} aria-hidden>
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  )
}