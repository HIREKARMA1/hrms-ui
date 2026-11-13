/**
 * Shared section header for HR Overview blocks (title, description, optional control).
 */

import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  aside?: ReactNode
  id?: string
}

export function OverviewSectionHeader({ title, description, aside, id }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 id={id} className="text-sm font-semibold text-hrms-navy">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-xs text-hrms-text-secondary">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}
