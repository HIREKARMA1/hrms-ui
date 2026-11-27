import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { APP_PAGE_SUBTITLE, APP_PAGE_TITLE } from './appUi'

type AppPageHeaderProps = {
  title: string
  description?: string
  trailing?: ReactNode
  className?: string
}

/** Consistent page title row for all authenticated feature pages. */
export function AppPageHeader({
  title,
  description,
  trailing,
  className,
}: AppPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className={APP_PAGE_TITLE}>{title}</h1>
        {description ? <p className={APP_PAGE_SUBTITLE}>{description}</p> : null}
      </div>
      {trailing ? (
        <div className="flex flex-wrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  )
}
