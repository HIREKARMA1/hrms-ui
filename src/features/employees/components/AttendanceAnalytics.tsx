import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetAttendanceAnalyticsQuery } from '../api/employeeDashboardApi'
import type { DateRangePreset } from '../types/employeeDashboard.types'
import {
  dashboardPeriodRange,
  formatDashboardAxisLabel,
} from '../utils/dashboardDateRange'

const periodOptions: { value: Exclude<DateRangePreset, 'custom'>; label: string }[] = [
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
]

export function AttendanceAnalytics() {
  const [period, setPeriod] =
    useState<Exclude<DateRangePreset, 'custom'>>('this-month')
  const range = useMemo(() => dashboardPeriodRange(period), [period])
  const { data, isLoading, isError, isFetching, error } =
    useGetAttendanceAnalyticsQuery(range)

  const summary = data?.summary
  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((point) => ({
        label: formatDashboardAxisLabel(point.date),
        present: point.present,
        absent: point.absent,
        onLeave: point.onLeave,
        late: point.late,
      })),
    [data?.series],
  )

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Attendance Analytics</CardTitle>
          <CardDescription>Present, absent, leave and late trends</CardDescription>
        </div>
        <Select
          value={period}
          onValueChange={(value) =>
            setPeriod(value as Exclude<DateRangePreset, 'custom'>)
          }
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom" disabled>
              Custom Range
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load attendance analytics.')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryChip label="Present" value={summary?.present ?? 0} color="#16A34A" />
              <SummaryChip label="Absent" value={summary?.absent ?? 0} color="#EF4444" />
              <SummaryChip label="On Leave" value={summary?.onLeave ?? 0} color="#3B82F6" />
              <SummaryChip label="Late" value={summary?.late ?? 0} color="#F59E0B" />
            </div>

            <div className={`h-64 w-full min-w-0 ${isFetching ? 'opacity-70' : ''}`}>
              {chartData.length === 0 ? (
                <p className="text-sm text-text-secondary">No attendance series for this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#667085', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#667085', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E6EF',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="present"
                      name="Present"
                      stroke="#16A34A"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      name="Absent"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="onLeave"
                      name="On Leave"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      name="Late"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryChip({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-2">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
