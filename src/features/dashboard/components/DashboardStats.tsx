/**
 * Workforce cards: Total, Active, Terminated from count APIs; leave/probation from summary.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { getApiErrorMessage } from '@/services/api/errors'

import {
  useGetDashboardEmployeesActiveQuery,
  useGetDashboardEmployeesInactiveQuery,
  useGetDashboardEmployeesTotalQuery,
  useGetDashboardSummaryQuery,
} from '../api/dashboardApi'
import { useShouldFetchDashboardSummary } from '../hooks/useShouldFetchDashboardSummary'
import {
  dashboardStatPlaceholders,
  mapSummaryToStats,
  withStatCardPlaceholder,
} from '../utils/mapSummaryToStats'
import { DASHBOARD_STATS_GRID_CLASS, DashboardStatsGrid } from './DashboardStatsGrid'

function DashboardStatsSkeleton() {
  return (
    <div className={DASHBOARD_STATS_GRID_CLASS} aria-busy="true" aria-label="Loading dashboard statistics">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardStats() {
  const shouldFetch = useShouldFetchDashboardSummary()

  const summaryQuery = useGetDashboardSummaryQuery(undefined, { skip: !shouldFetch })
  const totalQuery = useGetDashboardEmployeesTotalQuery(undefined, { skip: !shouldFetch })
  const activeQuery = useGetDashboardEmployeesActiveQuery(undefined, { skip: !shouldFetch })
  const inactiveQuery = useGetDashboardEmployeesInactiveQuery(undefined, { skip: !shouldFetch })

  const isLoading =
    shouldFetch &&
    (summaryQuery.isLoading ||
      totalQuery.isLoading ||
      activeQuery.isLoading ||
      inactiveQuery.isLoading)

  if (isLoading) {
    return <DashboardStatsSkeleton />
  }

  let stats = dashboardStatPlaceholders()
  if (summaryQuery.data) {
    stats = mapSummaryToStats(summaryQuery.data, {
      totalEmployees: totalQuery.isError ? undefined : totalQuery.data?.totalEmployees,
      activeEmployees: activeQuery.isError ? undefined : activeQuery.data?.activeEmployees,
      inactiveEmployees: inactiveQuery.isError ? undefined : inactiveQuery.data?.inactiveEmployees,
    })
    if (totalQuery.isError) stats = withStatCardPlaceholder(stats, 'total')
    if (activeQuery.isError) stats = withStatCardPlaceholder(stats, 'active')
    if (inactiveQuery.isError) stats = withStatCardPlaceholder(stats, 'terminated')
  }

  const errorMessages: string[] = []
  if (shouldFetch && summaryQuery.isError) {
    errorMessages.push(getApiErrorMessage(summaryQuery.error, 'Unable to load dashboard summary.'))
  }
  if (shouldFetch && totalQuery.isError && !summaryQuery.isError) {
    errorMessages.push(getApiErrorMessage(totalQuery.error, 'Unable to load total employee count.'))
  }
  if (shouldFetch && activeQuery.isError && !summaryQuery.isError) {
    errorMessages.push(getApiErrorMessage(activeQuery.error, 'Unable to load active employee count.'))
  }
  if (shouldFetch && inactiveQuery.isError && !summaryQuery.isError) {
    errorMessages.push(
      getApiErrorMessage(inactiveQuery.error, 'Unable to load terminated employee count.'),
    )
  }

  const summaryTotal = summaryQuery.data?.totalEmployees
  const recordTotal = totalQuery.data?.totalEmployees
  const totalMismatch =
    shouldFetch &&
    !summaryQuery.isError &&
    !totalQuery.isError &&
    summaryTotal != null &&
    recordTotal != null &&
    summaryTotal !== recordTotal

  const summaryActive = summaryQuery.data?.activeEmployees
  const statusActive = activeQuery.data?.activeEmployees
  const activeMismatch =
    shouldFetch &&
    !summaryQuery.isError &&
    !activeQuery.isError &&
    summaryActive != null &&
    statusActive != null &&
    summaryActive !== statusActive

  const summaryTerminated = summaryQuery.data?.inactiveEmployees
  const statusTerminated = inactiveQuery.data?.inactiveEmployees
  const terminatedMismatch =
    shouldFetch &&
    !summaryQuery.isError &&
    !inactiveQuery.isError &&
    summaryTerminated != null &&
    statusTerminated != null &&
    summaryTerminated !== statusTerminated

  return (
    <div className="flex flex-col gap-3">
      {totalMismatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950" role="status">
          Status summary reports {summaryTotal} employees in buckets; employee records count is {recordTotal}. The{' '}
          <strong>Total employees</strong> card uses the records count.
        </p>
      ) : null}
      {activeMismatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950" role="status">
          Summary reports {summaryActive} active in status buckets; the active count API reports {statusActive}. The{' '}
          <strong>Active</strong> card uses employment status ACTIVE only.
        </p>
      ) : null}
      {terminatedMismatch ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950" role="status">
          Summary reports {summaryTerminated} in the terminated bucket; the inactive count API reports{' '}
          {statusTerminated}. The <strong>Terminated</strong> card uses employment status TERMINATED only.
        </p>
      ) : null}
      {errorMessages.map((message) => (
        <p
          key={message}
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
          role="alert"
        >
          {message}
        </p>
      ))}
      <DashboardStatsGrid stats={stats} />
    </div>
  )
}