/**
 * GET /dashboard/employees/by-status — employment status breakdown.
 */

import { PieChart as PieChartIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetEmployeesByStatusQuery } from '../api/employeeDashboardApi'
import type { ByStatusQueryArgs, EmploymentStatusBucket } from '../api/employeeDashboardApi.types'
import { EMPLOYMENT_STATUS_CHART_COLORS } from '../utils/employmentStatusChartColors'
import {
  EMPLOYMENT_STATUS_DISTRIBUTION_FOOTNOTE,
  formatEmploymentStatusDistributionSubtitle,
} from '../utils/formatEmploymentStatusDistributionCaption'
import { formatEmploymentStatusLabel } from '../utils/formatNewJoinersCaption'
import { EmploymentStatusDistributionFilters } from './EmploymentStatusDistributionFilters'

type ChartSlice = {
  status: EmploymentStatusBucket
  label: string
  count: number
  percentage: number
  color: string
}

export function EmploymentStatusDistribution() {
  const [departmentId, setDepartmentId] = useState('all')

  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
  })
  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data?.items ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
      })),
    [departmentsQuery.data?.items],
  )

  const queryArgs = useMemo(
    (): ByStatusQueryArgs => ({
      departmentId: departmentId === 'all' ? undefined : departmentId,
    }),
    [departmentId],
  )

  const { data, isLoading, isError, isFetching, error } = useGetEmployeesByStatusQuery(queryArgs)

  const selectedDeptName = useMemo(
    () => departmentOptions.find((d) => d.id === departmentId)?.name,
    [departmentOptions, departmentId],
  )

  const legendData = useMemo((): ChartSlice[] => {
    const total = data?.totalEmployees ?? 0
    return (data?.items ?? []).map((item) => ({
      status: item.employmentStatus,
      label: formatEmploymentStatusLabel(item.employmentStatus),
      count: item.employeeCount,
      percentage: total > 0 ? Math.round((item.employeeCount / total) * 100) : 0,
      color: EMPLOYMENT_STATUS_CHART_COLORS[item.employmentStatus],
    }))
  }, [data])

  const pieData = useMemo(() => legendData.filter((item) => item.count > 0), [legendData])

  const subtitle = isLoading
    ? 'Loading status distribution…'
    : formatEmploymentStatusDistributionSubtitle(data, selectedDeptName)
  const showEmpty =
    !isLoading && !isError && (data?.empty === true || data?.totalEmployees === 0)

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-brand-500" />
            Employment status
          </CardTitle>
          <CardDescription>
            {subtitle}
            {isFetching && !isLoading ? (
              <span className="text-text-secondary"> · Updating…</span>
            ) : null}
          </CardDescription>
        </div>
        <EmploymentStatusDistributionFilters
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          departments={departmentOptions}
          departmentsLoading={departmentsQuery.isLoading}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load employment status distribution.')}
          </p>
        ) : showEmpty ? (
          <DashboardLiveEmpty
            title="No employees to chart"
            description="There is no headcount for this department filter."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="mx-auto h-56 w-full max-w-[240px]">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-center text-sm text-text-secondary">
                  All status counts are zero.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={2}
                    >
                      {pieData.map((item) => (
                        <Cell key={item.status} fill={item.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const slice = item?.payload as ChartSlice | undefined
                        const count =
                          typeof value === 'number' ? value : Number(value ?? 0)
                        const pct = slice?.percentage ?? 0
                        return [`${count} (${pct}%)`, slice?.label ?? 'Status']
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E6EF',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <ul className="space-y-2.5">
              {legendData.map((item) => (
                <li
                  key={item.status}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-text-secondary">{item.label}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-navy">
                    {item.count}
                    <span className="ml-1 text-xs font-medium text-text-secondary">
                      ({item.percentage}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!isLoading && !isError && !showEmpty ? (
          <p className="text-xs text-text-secondary">{EMPLOYMENT_STATUS_DISTRIBUTION_FOOTNOTE}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}