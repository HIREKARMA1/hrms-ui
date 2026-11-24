import { Card, CardContent } from '@/components/ui/card'

import { Skeleton } from '@/components/ui/skeleton'

import { getApiErrorMessage } from '@/services/api/errors'



import { useGetDashboardSummaryQuery } from '../api/dashboardApi'

import { useShouldFetchDashboardSummary } from '../hooks/useShouldFetchDashboardSummary'

import {

  dashboardStatPlaceholders,

  mapSummaryToStats,

} from '../utils/mapSummaryToStats'

import { DashboardStatsGrid } from './DashboardStatsGrid'



function DashboardStatsSkeleton() {

  return (

    <div

      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"

      aria-busy="true"

      aria-label="Loading dashboard statistics"

    >

      {Array.from({ length: 4 }).map((_, index) => (

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



/** Live org workforce summary (`GET /dashboard/summary`). Skips without token + `employees:read`. */

export function DashboardStats() {

  const shouldFetch = useShouldFetchDashboardSummary()

  const { data, isLoading, isError, error } = useGetDashboardSummaryQuery(

    undefined,

    { skip: !shouldFetch },

  )



  if (shouldFetch && isLoading) {

    return <DashboardStatsSkeleton />

  }



  const stats = data ? mapSummaryToStats(data) : dashboardStatPlaceholders()

  const errorMessage =

    shouldFetch && isError

      ? getApiErrorMessage(

          error,

          'Unable to load dashboard summary. Please try again.',

        )

      : null



  return (

    <div className="flex flex-col gap-3">

      {errorMessage ? (

        <p

          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"

          role="alert"

        >

          {errorMessage}

        </p>

      ) : null}

      <DashboardStatsGrid stats={stats} />

    </div>

  )

}


