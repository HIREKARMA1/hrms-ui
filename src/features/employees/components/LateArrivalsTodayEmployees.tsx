/**
 * GET /dashboard/attendance/late-arrivals — late check-ins for today (default date).
 */

import { Clock } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

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

import { useGetLateArrivalsTodayQuery } from '../api/employeeDashboardApi'
import { formatAbsentNonWorkingDayMessage } from '../utils/formatAbsentTodayPanel'
import {
  formatDashboardDate,
  initialsFromName,
  todayIsoDate,
} from '../utils/dashboardDateRange'
import { formatDeviceClockTime } from '../utils/formatDeviceClockTime'
import { formatLateArrivalsShiftHint } from '../utils/formatLateArrivalsPanel'
import { LateArrivalsDateFilter } from './LateArrivalsDateFilter'

const PAGE_SIZE = 20

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function LateArrivalsTodayEmployees() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.stats')
  const [page, setPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState(() => todayIsoDate())

  const queryArgs = useMemo(() => {
    const base = { page, limit: PAGE_SIZE }
    if (selectedDate === todayIsoDate()) return base
    return { ...base, date: selectedDate }
  }, [page, selectedDate])

  const { data, isLoading, isError, isFetching, error } = useGetLateArrivalsTodayQuery(
    queryArgs,
    { skip: !allowed },
  )

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? (total > 0 ? 1 : 1)
  const nonWorkingDay = !isLoading && !isError && data?.workingDay === false
  const showEmptyLate =
    !isLoading && !isError && data?.workingDay !== false && (data?.empty === true || total === 0)
  const showPastPage =
    !isLoading && !isError && total > 0 && items.length === 0 && page > 1
  const shiftHint = formatLateArrivalsShiftHint(data?.shift)

  const subtitle = data
    ? `${formatDashboardDate(data.date)} · ${data.timezone} · ${total} late`
    : 'Check-in after shift start + grace'

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        isFetchError(error) && error.status === 503
          ? 'Attendance device is not configured or unreachable.'
          : 'Could not load late arrivals.',
      )
    : null

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Late arrivals
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading late arrivals…' : subtitle}
            {shiftHint && !isLoading ? ` · ${shiftHint}` : null}
            {isFetching && !isLoading ? (
              <span className="text-text-secondary"> · Updating…</span>
            ) : null}
          </CardDescription>
        </div>
        <LateArrivalsDateFilter
          value={selectedDate}
          onChange={(isoDate) => {
            setSelectedDate(isoDate)
            setPage(1)
          }}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && data && (data.skippedEmployees ?? 0) > 0 ? (
          <p
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
            role="status"
          >
            {data.skippedEmployees} employee{(data.skippedEmployees ?? 0) === 1 ? '' : 's'} could not
            be checked on the device.
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
        ) : nonWorkingDay ? (
          <DashboardLiveEmpty
            title="Non-working day"
            description={formatAbsentNonWorkingDayMessage(data?.nonWorkingDay)}
          />
        ) : showEmptyLate ? (
          <DashboardLiveEmpty
            title="No late arrivals on this date"
            description="Everyone who punched in checked in on time, or nobody has a punch for this date."
          />
        ) : showPastPage ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">No rows on this page.</p>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="late"
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
                  <TableHead className="text-right">Late by</TableHead>
                  <TableHead className="text-right">Half day</TableHead>
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
                    <TableCell className="text-right tabular-nums text-amber-700">
                      {employee.lateMinutes > 0 ? `${employee.lateMinutes} min` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {employee.halfDay ? (
                        <Badge variant="warning">Yes</Badge>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
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
                itemLabel="late"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}