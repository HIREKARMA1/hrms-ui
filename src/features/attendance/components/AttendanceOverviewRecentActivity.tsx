import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import { useGetPresentTodayQuery } from '@/features/employees/api/employeeDashboardApi'
import { formatDeviceClockTime } from '@/features/employees/utils/formatDeviceClockTime'
import { getApiErrorMessage } from '@/services/api/errors'

import { formatDeviceWorkingDuration } from '../utils/formatDeviceWorkingDuration'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

const PAGE_SIZE = 10

export function AttendanceOverviewRecentActivity() {
  const { data, isLoading, isError, error } = useGetPresentTodayQuery({
    page: 1,
    limit: PAGE_SIZE,
  })

  const items = data?.items ?? []

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Recent Attendance Activity</CardTitle>
        <CardDescription>
          Latest check-ins from today&apos;s present list (device punches)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-700" role="alert">
            {getApiErrorMessage(error, 'Could not load recent attendance activity.')}
          </p>
        ) : data?.empty || items.length === 0 ? (
          <DashboardLiveEmpty
            title="No punches yet today"
            description="Nobody is marked present with a device punch for today."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft text-text-secondary">
                  <th className="pb-3 pr-3 font-medium">Employee</th>
                  <th className="pb-3 pr-3 font-medium">Check-in</th>
                  <th className="pb-3 pr-3 font-medium">Check-out</th>
                  <th className="pb-3 pr-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.employeeId}
                    className="border-b border-border-soft/60 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <p className="font-medium text-navy">{row.employeeName}</p>
                      <p className="text-xs text-text-secondary">{row.employeeCode}</p>
                    </td>
                    <td className="py-3 pr-3 text-text-secondary">
                      {formatDeviceClockTime(row.checkInTime)}
                    </td>
                    <td className="py-3 pr-3 text-text-secondary">
                      {formatDeviceClockTime(row.checkOutTime)}
                    </td>
                    <td className="py-3 pr-3 text-text-secondary">
                      {formatDeviceWorkingDuration(row.checkInTime, row.checkOutTime)}
                    </td>
                    <td className="py-3">
                      <AttendanceStatusBadge status="Present" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}