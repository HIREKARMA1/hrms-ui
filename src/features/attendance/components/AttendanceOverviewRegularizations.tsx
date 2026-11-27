import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'

import { useListAttendanceRegularizationsQuery } from '../api/attendanceRegularizationApi'
import { AttendanceRegularizationTable } from './regularization/AttendanceRegularizationTable'

const LIST_LIMIT = 8

export function AttendanceOverviewRegularizations() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('attendance.regularization')

  const { data, isLoading, isError, error } = useListAttendanceRegularizationsQuery(
    { page: 1, limit: LIST_LIMIT, includeRevoked: false },
    { skip: !allowed },
  )

  const items = data?.items ?? []

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Recent regularizations</CardTitle>
        <CardDescription>
          Active attendance regularisations from the audit trail (not revoked)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!allowed ? (
          <p className="text-sm text-text-secondary">
            You need attendance regularization access to view this list.
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-700" role="alert">
            {getApiErrorMessage(error, 'Could not load regularizations.')}
          </p>
        ) : items.length === 0 ? (
          <DashboardLiveEmpty
            title="No regularizations"
            description="No active regularisation records returned by the API."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-soft">
            <AttendanceRegularizationTable items={items} showCreated={false} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}