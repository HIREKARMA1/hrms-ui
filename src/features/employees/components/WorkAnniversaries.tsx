import { Award } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

import { useGetUpcomingAnniversariesQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  initialsFromName,
} from '../utils/dashboardDateRange'

export function WorkAnniversaries() {
  const { data, isLoading, isError, error } = useGetUpcomingAnniversariesQuery({
    page: 1,
    limit: 8,
    days: 30,
  })
  const items = data?.items ?? []

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-500" />
          Work Anniversaries
        </CardTitle>
        <CardDescription>Years of service milestones in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load work anniversaries.')}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-secondary">No upcoming anniversaries in this window.</p>
        ) : (
          items.map((employee) => (
            <div
              key={employee.employeeId}
              className="flex items-center gap-3 rounded-xl border border-border-soft bg-muted-bg/40 p-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initialsFromName(employee.employeeName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{employee.employeeName}</p>
                <p className="truncate text-xs text-text-secondary">
                  Joined {formatDashboardDate(employee.joiningDate)}
                </p>
              </div>
              <Badge variant="default">{employee.yearsOfService} yrs</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
