/**
 * GET /dashboard/leaves/on-leave — approved leave covering today.
 */

import { CalendarDays } from 'lucide-react'
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

import { useGetOnLeaveTodayQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  initialsFromName,
} from '../utils/dashboardDateRange'
import {
  formatOnLeaveDayPortion,
  formatOnLeaveRequestDates,
} from '../utils/formatOnLeaveTodayPanel'

const PAGE_SIZE = 20

function isFetchError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function OnLeaveTodayEmployees() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.leaveAnalytics')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching, error } = useGetOnLeaveTodayQuery(
    { page, limit: PAGE_SIZE },
    { skip: !allowed },
  )

  if (!allowed) {
    return null
  }

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? (total > 0 ? 1 : 1)
  const showEmpty =
    !isLoading && !isError && (data?.empty === true || total === 0)
  const showPastPage =
    !isLoading && !isError && total > 0 && items.length === 0 && page > 1

  const subtitle = data
    ? `${formatDashboardDate(data.date)} · ${data.timezone} · ${total} on approved leave`
    : 'Approved leave requests covering today'

  const errorMessage = isError
    ? getApiErrorMessage(
        error,
        isFetchError(error) && error.status === 403
          ? 'You do not have permission to view who is on leave today.'
          : 'Could not load today’s employees on leave.',
      )
    : null

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#3B82F6]" />
          On leave today
        </CardTitle>
        <CardDescription>
          {isLoading ? 'Loading leave roster…' : subtitle}
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
        ) : showEmpty ? (
          <DashboardLiveEmpty
            title="No one on approved leave today"
            description="No APPROVED leave requests cover today’s date in the application timezone."
          />
        ) : showPastPage ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">No rows on this page.</p>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              itemLabel="on leave"
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
                  <TableHead>Leave type</TableHead>
                  <TableHead>Leave dates</TableHead>
                  <TableHead>Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.leaveRequestId}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {initialsFromName(row.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{row.employeeCode}</TableCell>
                    <TableCell className="text-text-secondary">
                      {row.department?.name ?? 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {row.leaveType?.name ?? row.leaveType?.code ?? '—'}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatOnLeaveRequestDates(row.startDate, row.endDate)}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatOnLeaveDayPortion(row.dayPortion)}
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
                itemLabel="on leave"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}