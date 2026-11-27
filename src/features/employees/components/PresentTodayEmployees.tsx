/**
 * GET /dashboard/attendance/present-today — paginated roster for today (device punches).
 */

import { UserCheck } from 'lucide-react'
import { useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetPresentTodayQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  initialsFromName,
} from '../utils/dashboardDateRange'
import { formatDeviceClockTime } from '../utils/formatDeviceClockTime'

const PAGE_SIZE = 20

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function PresentTodayEmployees() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.stats')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching, error } = useGetPresentTodayQuery(
    { page, limit: PAGE_SIZE },
    { skip: !allowed },
  )

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? (total > 0 ? 1 : 1)
  const showEmpty =
    !isLoading && !isError && (data?.empty === true || total === 0)
  const showPastPage =
    !isLoading && !isError && total > 0 && items.length === 0 && page > 1

  const subtitle = data
    ? `${formatDashboardDate(data.date)} · ${data.timezone} · ${total} present`
    : 'Live punches from the biometric device'

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        isFetchError(error) && error.status === 503
          ? 'Attendance device is not configured or unreachable.'
          : 'Could not load today’s present employees.',
      )
    : null

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-emerald-600" />
          Present today
        </CardTitle>
        <CardDescription>
          {isLoading ? 'Loading present employees…' : subtitle}
          {isFetching && !isLoading ? (
            <span className="text-text-secondary"> · Updating…</span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && data && data.skippedEmployees > 0 ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
            role="status"
          >
            {data.skippedEmployees} employee{data.skippedEmployees === 1 ? '' : 's'} could not be
            checked on the device; counts may be incomplete.
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-700" role="alert">
            {errorMessage}
          </p>
        ) : showEmpty ? (
          <DashboardLiveEmpty
            title="No present employees today"
            description="No linked employees have a device punch for today’s date in the application timezone."
          />
        ) : showPastPage ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">No rows on this page.</p>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="present"
              onPageChange={setPage}
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="text-right">Punches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((employee) => (
                  <TableRow key={employee.employeeId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {initialsFromName(employee.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{employee.employeeCode}</TableCell>
                    <TableCell className="text-text-secondary">
                      {employee.department?.name ?? 'Unassigned'}
                    </TableCell>
                    <TableCell className="tabular-nums text-text-secondary">
                      {formatDeviceClockTime(employee.checkInTime)}
                    </TableCell>
                    <TableCell className="tabular-nums text-text-secondary">
                      {formatDeviceClockTime(employee.checkOutTime)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-text-secondary">
                      {employee.punchCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 || total > PAGE_SIZE ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                itemLabel="present"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}