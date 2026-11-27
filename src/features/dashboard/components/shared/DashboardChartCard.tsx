import type { ReactNode } from 'react'

import { DASH_CARD, DASH_CARD_HEADER, DASH_SECTION_DESC, DASH_SECTION_TITLE } from './dashboardUi'

type DashboardChartCardProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardChartCard({
  title,
  description,
  action,
  children,
  className,
}: DashboardChartCardProps) {
  return (
    <section className={`${DASH_CARD} ${className ?? ''}`}>
      <div className={`${DASH_CARD_HEADER} flex items-start justify-between gap-3`}>
        <div>
          <h2 className={DASH_SECTION_TITLE}>{title}</h2>
          {description ? <p className={DASH_SECTION_DESC}>{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
