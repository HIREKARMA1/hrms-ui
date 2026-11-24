import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetTerminatedEmployeesQuery } from '../api/employeeDashboardApi'
import { useEmployeeSummary } from '../hooks/useEmployeeSummary'

/**
 * Attrition snapshot from live headcount + terminated list totals.
 * Monthly trend series is not available from the API yet.
 */
export function EmployeeAttrition() {
  const { summary, isLoading: summaryLoading, isError: summaryError, error: summaryErr } =
    useEmployeeSummary()
  const terminatedQuery = useGetTerminatedEmployeesQuery({ page: 1, limit: 1 })

  const totalEmployees = summary?.totalEmployees ?? 0
  const exitedTotal =
    terminatedQuery.data?.pagination.total ?? summary?.inactiveEmployees ?? 0
  const currentRate =
    totalEmployees > 0 ? Math.round((exitedTotal / totalEmployees) * 1000) / 10 : 0
  const activeEmployees = summary?.activeEmployees ?? 0

  const loading = summaryLoading || terminatedQuery.isLoading
  const error = summaryError || terminatedQuery.isError

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Employee Attrition Rate</CardTitle>
        <CardDescription>
          Terminated headcount vs total workforce (live). Monthly trend will come later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : error ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(
              summaryErr ?? terminatedQuery.error,
              'Could not load attrition metrics.',
            )}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Current Rate" value={`${currentRate}%`} emphasis />
            <Metric label="Terminated" value={String(exitedTotal)} />
            <Metric label="Active Workforce" value={String(activeEmployees)} />
            <Metric label="Total Employees" value={String(totalEmployees)} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-2">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p
        className={
          emphasis
            ? 'mt-1 text-xl font-bold text-brand-500'
            : 'mt-1 text-lg font-bold text-navy'
        }
      >
        {value}
      </p>
    </div>
  )
}
