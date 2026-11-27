/**

 * GET /dashboard/employees/by-department — pie chart and department list.

 */



import { Building2 } from 'lucide-react'

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

import { getApiErrorMessage } from '@/services/api/errors'



import { useGetEmployeesByDepartmentQuery } from '../api/employeeDashboardApi'

import type { ByDepartmentQueryArgs } from '../api/employeeDashboardApi.types'

import { DEPARTMENT_CHART_COLORS } from '../utils/dashboardDateRange'

import { formatDepartmentDistributionSubtitle } from '../utils/formatDepartmentDistributionCaption'

import { formatDepartmentDistributionLabel } from '../utils/formatDepartmentDistributionLabel'

import { DepartmentDistributionFilters } from './DepartmentDistributionFilters'



type ChartSlice = {

  id: string

  label: string

  count: number

  percentage: number

  color: string

}



export function DepartmentDistribution() {

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<'all' | ByDepartmentQueryArgs['employmentStatus']>(

    'all',

  )



  const queryArgs = useMemo(

    (): ByDepartmentQueryArgs => ({

      search: search.trim() || undefined,

      employmentStatus: statusFilter === 'all' ? undefined : statusFilter,

    }),

    [search, statusFilter],

  )



  const { data, isLoading, isError, isFetching, error } =

    useGetEmployeesByDepartmentQuery(queryArgs)



  const chartData = useMemo((): ChartSlice[] => {

    const total = data?.totalEmployees ?? 0

    return (data?.items ?? []).map((item, index) => ({

      id: item.departmentId ?? 'unassigned',

      label: formatDepartmentDistributionLabel(item),

      count: item.employeeCount,

      percentage: total > 0 ? Math.round((item.employeeCount / total) * 100) : 0,

      color: DEPARTMENT_CHART_COLORS[index % DEPARTMENT_CHART_COLORS.length],

    }))

  }, [data])



  const subtitle = isLoading

    ? 'Loading department headcount…'

    : formatDepartmentDistributionSubtitle(data)

  const showEmpty = !isLoading && !isError && (data?.empty === true || chartData.length === 0)



  return (

    <Card className="h-full border-border-soft shadow-sm">

      <CardHeader className="gap-3">

        <div className="space-y-1">

          <CardTitle className="flex items-center gap-2">

            <Building2 className="h-4 w-4 text-brand-500" />

            Department distribution

          </CardTitle>

          <CardDescription>

            {subtitle}

            {isFetching && !isLoading ? (

              <span className="text-text-secondary"> · Updating…</span>

            ) : null}

          </CardDescription>

        </div>

        <DepartmentDistributionFilters

          search={search}

          onSearchChange={setSearch}

          employmentStatus={statusFilter}

          onEmploymentStatusChange={setStatusFilter}

        />

      </CardHeader>

      <CardContent className="space-y-3">

        {isLoading ? (

          <Skeleton className="h-56 w-full rounded-xl" />

        ) : isError ? (

          <p className="text-sm text-rose-700">

            {getApiErrorMessage(error, 'Could not load department distribution.')}

          </p>

        ) : showEmpty ? (

          <DashboardLiveEmpty

            title="No department breakdown to show"

            description="Try clearing the search or employment status filter, or assign employees to departments."

          />

        ) : (

          <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-center">

            <div className="mx-auto h-56 w-full max-w-[240px]">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie

                    data={chartData}

                    dataKey="count"

                    nameKey="label"

                    innerRadius={58}

                    outerRadius={84}

                    paddingAngle={2}

                  >

                    {chartData.map((item) => (

                      <Cell key={item.id} fill={item.color} stroke="none" />

                    ))}

                  </Pie>

                  <Tooltip

                    formatter={(value, _name, item) => {
                      const slice = item?.payload as ChartSlice | undefined
                      const count =
                        typeof value === 'number' ? value : Number(value ?? 0)
                      const pct = slice?.percentage ?? 0
                      return [`${count} (${pct}%)`, slice?.label ?? 'Department']
                    }}

                    contentStyle={{

                      borderRadius: 12,

                      border: '1px solid #E2E6EF',

                    }}

                  />

                </PieChart>

              </ResponsiveContainer>

            </div>



            <ul className="max-h-56 space-y-2.5 overflow-y-auto pr-1">

              {chartData.map((item) => (

                <li

                  key={item.id}

                  className="flex items-center justify-between gap-3 text-sm"

                >

                  <div className="flex min-w-0 items-center gap-2.5">

                    <span

                      className="h-2.5 w-2.5 shrink-0 rounded-full"

                      style={{ backgroundColor: item.color }}

                    />

                    <span className="truncate text-text-secondary" title={item.label}>

                      {item.label}

                    </span>

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

      </CardContent>

    </Card>

  )

}
