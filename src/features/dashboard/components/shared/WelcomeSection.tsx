import type { ReactNode } from 'react'

import { DASH_SUBTITLE, DASH_TITLE } from './dashboardUi'

type WelcomeSectionProps = {
  title: string
  subtitle: string
  trailing?: ReactNode
}

export function WelcomeSection({ title, subtitle, trailing }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className={DASH_TITLE}>{title}</h1>
        <p className={DASH_SUBTITLE}>{subtitle}</p>
      </div>
      {trailing ? <div className="flex flex-wrap gap-2">{trailing}</div> : null}
    </div>
  )
}
