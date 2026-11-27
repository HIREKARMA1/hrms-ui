/**

 * Shared Overview section card with skeleton, empty, error, and optional scroll body.

 */



import type { ReactNode } from 'react'



import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'



type OverviewCardProps = {

  title: string

  description: string

  rangeHint?: string

  loading?: boolean

  error?: string | null

  onRetry?: () => void

  empty?: boolean

  emptyMessage?: string

  children: ReactNode

  className?: string

  headerAside?: ReactNode

  /** Scrollable body; caps height when compact, fills card when fillHeight. */

  scrollBody?: boolean

  skeleton?: 'chart' | 'list' | 'strip' | 'stats'

  /** Content-height card for sparse lists (no row stretch). */

  compact?: boolean

  /** Fill grid row height (charts/trend row). */

  fillHeight?: boolean

  chrome?: 'default' | 'overview'

}



export function OverviewCard({

  title,

  description,

  rangeHint,

  loading,

  error,

  onRetry,

  empty,

  emptyMessage = 'No data for this period.',

  children,

  className,

  headerAside,

  scrollBody,

  skeleton = 'chart',

  compact,

  fillHeight,

  chrome = 'default',

}: OverviewCardProps) {

  const stretch = fillHeight && !compact
  const overview = chrome === 'overview'

  return (

    <article

      className={cn(

        'flex flex-col bg-white',

        overview
          ? 'rounded-[14px] border border-[#E2E6EF] p-5 shadow-none'
          : 'rounded-xl border border-hrms-border p-5',

        stretch && 'h-full min-h-[12rem]',

        compact && 'w-full',

        className,

      )}

    >

      <header className="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-2">

        <div className="min-w-0">

          <h3
            className={cn(
              'font-semibold text-hrms-navy',
              overview ? 'text-[17px] font-[650] text-[#17213A]' : 'text-sm',
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              'mt-0.5 text-hrms-text-secondary',
              overview ? 'text-[13px] text-[#667085]' : 'text-xs',
            )}
          >
            {description}
          </p>

          {rangeHint ? <p className="mt-1 text-[11px] font-medium text-hrms-text-muted">{rangeHint}</p> : null}

        </div>

        {headerAside}

      </header>

      <div

        className={cn(

          stretch && 'min-h-0 flex-1',

          scrollBody && stretch && 'overflow-y-auto',

          scrollBody && !stretch && 'max-h-[min(420px,70vh)] overflow-y-auto',

        )}

      >

        {loading ? <OverviewCardSkeleton kind={skeleton} /> : null}

        {!loading && error ? (

          <div>

            <p className="text-sm text-hrms-danger">{error}</p>

            {onRetry ? (

              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}>

                Try again

              </Button>

            ) : null}

          </div>

        ) : null}

        {!loading && !error && empty ? <p className="text-sm text-hrms-text-secondary">{emptyMessage}</p> : null}

        {!loading && !error && !empty ? children : null}

      </div>

    </article>

  )

}



function OverviewCardSkeleton({ kind }: { kind: OverviewCardProps['skeleton'] }) {

  if (kind === 'strip') {

    return (

      <div className="grid grid-cols-7 gap-1 sm:grid-cols-14" aria-hidden>

        {Array.from({ length: 14 }).map((_, index) => (

          <div key={index} className="h-20 animate-pulse rounded-lg bg-hrms-muted-bg motion-reduce:animate-none" />

        ))}

      </div>

    )

  }

  const tall = kind !== 'list'

  return (

    <div className="animate-pulse space-y-2 motion-reduce:animate-none" aria-hidden>

      <div className={cn('rounded-lg bg-hrms-muted-bg', tall ? 'h-40' : 'h-28')} />

      <div className="h-3 w-4/5 rounded bg-hrms-muted-bg" />

      <div className="h-3 w-2/3 rounded bg-hrms-muted-bg" />

    </div>

  )

}


