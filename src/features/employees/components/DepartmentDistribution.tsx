import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

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
import { DEPARTMENT_CHART_COLORS } from '../utils/dashboardDateRange'

export function DepartmentDistribution() {
  const { data, isLoading, isError, error } = useGetEmployeesByDepartmentQuery()

  const chartData = useMemo(() => {
    const total = data?.totalEmployees ?? 0
    return (data?.items ?? []).map((item, index) => ({
      department: item.departmentName,
      count: item.employeeCount,
      percentage: total > 0 ? Math.round((item.employeeCount / total) * 100) : 0,
      color: DEPARTMENT_CHART_COLORS[index % DEPARTMENT_CHART_COLORS.length],
    }))
  }, [data])

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Department-wise Distribution</CardTitle>
        <CardDescription>Workforce split across departments</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load department distribution.')}
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-text-secondary">No department data available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="mx-auto h-56 w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="department"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {chartData.map((item) => (
                      <Cell key={item.department} fill={item.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2E6EF',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-3">
              {chartData.map((item) => (
                <li
                  key={item.department}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-text-secondary">{item.department}</span>
                  </div>
                  <span className="font-semibold text-navy">
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
