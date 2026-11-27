import { Skeleton } from '@/components/ui/skeleton'

import { DASH_CARD } from './dashboardUi'

export function DashboardStatSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading dashboard statistics"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${DASH_CARD} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-16" />
            </div>
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardPanelSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`${DASH_CARD} p-5`} aria-busy="true">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className={`${height} w-full rounded-xl`} />
    </div>
  )
}
