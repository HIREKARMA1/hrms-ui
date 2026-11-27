import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetLeaveAnalyticsQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  LEAVE_TYPE_CHART_COLORS,
} from '../utils/dashboardDateRange'

type LeaveAnalyticsProps = {
  startDate: string
  endDate: string
}

export function LeaveAnalytics({ startDate, endDate }: LeaveAnalyticsProps) {
  const { data, isLoading, isError, error } = useGetLeaveAnalyticsQuery({
    startDate,
    endDate,
  })
  const summary = data?.summary
  const periodLabel = `${formatDashboardDate(startDate)} – ${formatDashboardDate(endDate)}`

  const leaveTypeDistribution = useMemo(
    () =>
      (data?.byLeaveType ?? []).map((item, index) => ({
        type: item.leaveTypeName,
        count: item.requestCount,
        color: LEAVE_TYPE_CHART_COLORS[index % LEAVE_TYPE_CHART_COLORS.length],
      })),
    [data?.byLeaveType],
  )

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Leave Analytics</CardTitle>
        <CardDescription>
          Leave request status and type mix · {periodLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load leave analytics.')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatusStat label="Total" value={summary?.totalLeaveRequests ?? 0} />
              <StatusStat label="Approved" value={summary?.approved ?? 0} tone="success" />
              <StatusStat label="Pending" value={summary?.pending ?? 0} tone="warning" />
              <StatusStat label="Rejected" value={summary?.rejected ?? 0} tone="danger" />
            </div>

            {leaveTypeDistribution.length === 0 ? (
              <p className="text-sm text-text-secondary">No leave requests in this period.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-center">
                <div className="mx-auto h-52 w-full max-w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveTypeDistribution}
                        dataKey="count"
                        nameKey="type"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={3}
                      >
                        {leaveTypeDistribution.map((item) => (
                          <Cell key={item.type} fill={item.color} stroke="none" />
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

                <ul className="space-y-2.5">
                  {leaveTypeDistribution.map((item) => (
                    <li
                      key={item.type}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-text-secondary">{item.type}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function StatusStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'success' | 'warning' | 'danger'
}) {
  const color =
    tone === 'success'
      ? 'text-[#16A34A]'
      : tone === 'warning'
        ? 'text-[#F59E0B]'
        : tone === 'danger'
          ? 'text-[#EF4444]'
          : 'text-navy'

  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-2">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}
