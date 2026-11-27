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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 id={id} className="text-[17px] font-semibold text-[#17213A]">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[13px] text-[#667085]">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}
