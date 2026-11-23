import { Skeleton } from '@/components/ui/skeleton'

import { CALENDAR_CARD_SHELL } from './shared/officeCalendarUi'

export function OfficeCalendarPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4" aria-busy="true" aria-label="Loading office calendar">
      <div className="border-b border-hrms-border pb-3 pt-1">
        <Skeleton className="h-8 w-48 bg-hrms-muted-bg" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full bg-hrms-muted-bg" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <GridSkeleton />
        <AgendaSkeleton />
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className={CALENDAR_CARD_SHELL}>
      <Skeleton className="h-12 w-full rounded-none bg-hrms-muted-bg" />
      <Skeleton className="h-8 w-full rounded-none bg-hrms-muted-bg/80" />
      <div className="grid grid-cols-7 gap-px bg-hrms-border p-px">
        {Array.from({ length: 42 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[4.5rem] bg-hrms-muted-bg/70 sm:min-h-[5.5rem]" />
        ))}
      </div>
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div className={CALENDAR_CARD_SHELL}>
      <Skeleton className="h-16 w-full rounded-none bg-hrms-muted-bg" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="mx-4 my-3 h-14 bg-hrms-muted-bg/80" />
      ))}
    </div>
  )
}