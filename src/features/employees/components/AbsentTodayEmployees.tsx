/**
 * GET /dashboard/attendance/absent-today — paginated roster for today.
 */

import { UserX } from 'lucide-react'
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

import { useGetAbsentTodayQuery } from '../api/employeeDashboardApi'
import { formatAbsentNonWorkingDayMessage } from '../utils/formatAbsentTodayPanel'
import {
  formatDashboardDate,
  initialsFromName,
} from '../utils/dashboardDateRange'

const PAGE_SIZE = 20

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function AbsentTodayEmployees() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.stats')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching, error } = useGetAbsentTodayQuery(
    { page, limit: PAGE_SIZE },
    { skip: !allowed },
  )

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? (total > 0 ? 1 : 1)
  const nonWorkingDay = !isLoading && !isError && data?.workingDay === false
  const showEmptyAbsent =
    !isLoading && !isError && data?.workingDay !== false && (data?.empty === true || total === 0)
  const showPastPage =
    !isLoading && !isError && total > 0 && items.length === 0 && page > 1

  const subtitle = data
    ? `${formatDashboardDate(data.date)} · ${data.timezone} · ${total} absent`
    : 'Eligible employees with no punch and no approved leave today'

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        isFetchError(error) && error.status === 503
          ? 'Attendance device is not configured or unreachable.'
          : 'Could not load today’s absent employees.',
      )
    : null

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-4 w-4 text-rose-600" />
          Absent today
        </CardTitle>
        <CardDescription>
          {isLoading ? 'Loading absent employees…' : subtitle}
          {isFetching && !isLoading ? (
            <span className="text-text-secondary"> · Updating…</span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        ) : nonWorkingDay ? (
          <DashboardLiveEmpty
            title="Non-working day"
            description={formatAbsentNonWorkingDayMessage(data?.nonWorkingDay)}
          />
        ) : showEmptyAbsent ? (
          <DashboardLiveEmpty
            title="No absent employees today"
            description="Every eligible employee either punched in, is on approved leave, or is outside today’s absence rules."
          />
        ) : showPastPage ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">No rows on this page.</p>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="absent"
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 || total > PAGE_SIZE ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                itemLabel="absent"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}