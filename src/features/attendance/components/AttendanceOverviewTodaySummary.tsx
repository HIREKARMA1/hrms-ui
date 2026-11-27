import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useAttendanceOverviewTodayMetrics } from '../hooks/useAttendanceOverviewTodayMetrics'

const SUMMARY_ITEMS = [
  { key: 'present', label: 'Present', color: '#16A34A' },
  { key: 'absent', label: 'Absent', color: '#EF4444' },
  { key: 'late', label: 'Late', color: '#F59E0B' },
  { key: 'leave', label: 'On Leave', color: '#3B82F6' },
] as const

export function AttendanceOverviewTodaySummary() {
  const metrics = useAttendanceOverviewTodayMetrics()

  const values: Record<(typeof SUMMARY_ITEMS)[number]['key'], number> = {
    present: metrics.presentToday,
    absent: metrics.absentToday,
    late: metrics.lateToday,
    leave: metrics.onLeaveToday,
  }

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Today&apos;s Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SUMMARY_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-xl border border-border-soft bg-muted-bg/50 px-4 py-3"
            >
              <span className="text-sm font-medium text-text-secondary">{item.label}</span>
              {metrics.statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: item.color }}
                >
                  {values[item.key]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}