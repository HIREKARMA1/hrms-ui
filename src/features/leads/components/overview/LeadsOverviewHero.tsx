import type { ReactNode } from 'react'

import { OVERVIEW_CARD } from './leadsOverviewUi'

type LeadsOverviewHeroProps = {
  children: ReactNode
}

/** KPI + quick actions card shell (no inner title band). */
export function LeadsOverviewHero({ children }: LeadsOverviewHeroProps) {
  return (
    <section className={OVERVIEW_CARD} aria-label="Pipeline summary">
      <div className="min-h-0">{children}</div>
    </section>
  )
}