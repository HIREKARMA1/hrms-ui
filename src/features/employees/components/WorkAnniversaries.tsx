/**
 * GET /dashboard/employees/upcoming-anniversaries — windowed list with filters.
 */

import { Award } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { TablePagination } from '@/components/ui/table-pagination'
import { DashboardLiveEmpty } from '@/features/dashboard/components/shared/DashboardLiveEmpty'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetUpcomingAnniversariesQuery } from '../api/employeeDashboardApi'
import { formatDashboardDate, initialsFromName } from '../utils/dashboardDateRange'
import {
  formatUpcomingAnniversariesSubtitle,
  formatUpcomingAnniversaryBadge,
} from '../utils/formatUpcomingAnniversaryCaption'
import { UpcomingMilestoneFilters } from './UpcomingMilestoneFilters'

const PAGE_SIZE = 8

export function WorkAnniversaries() {
  const [page, setPage] = useState(1)
  const [days, setDays] = useState(30)
  const [departmentId, setDepartmentId] = useState('all')
  const [search, setSearch] = useState('')

  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
  })
  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data?.items ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
      })),
    [departmentsQuery.data?.items],
  )

  const queryArgs = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      days,
      departmentId: departmentId === 'all' ? undefined : departmentId,
      search: search.trim() || undefined,
    }),
    [page, days, departmentId, search],
  )

  const { data, isLoading, isError, isFetching, error } =
    useGetUpcomingAnniversariesQuery(queryArgs)

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? 1
  const subtitle = isLoading
    ? 'Loading work anniversaries…'
    : formatUpcomingAnniversariesSubtitle(data)

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-500" />
            Work Anniversaries
          </CardTitle>
          <CardDescription>
            {subtitle}
            {isFetching && !isLoading ? (
              <span className="text-text-secondary"> · Updating…</span>
            ) : null}
          </CardDescription>
        </div>
        <UpcomingMilestoneFilters
          days={days}
          onDaysChange={(next) => {
            setDays(next)
            setPage(1)
          }}
          departmentId={departmentId}
          onDepartmentChange={(value) => {
            setDepartmentId(value)
            setPage(1)
          }}
          departments={departmentOptions}
          departmentsLoading={departmentsQuery.isLoading}
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchAriaLabel="Search upcoming work anniversaries"
        />
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
        ) : data?.empty === true || items.length === 0 ? (
          <DashboardLiveEmpty
            title="No upcoming anniversaries"
            description="No employees have a work anniversary in this window with the current filters."
          />
        ) : (
          <>
            {items.map((employee) => (
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
                    {employee.employeeCode}
                    {' · '}
                    {employee.department?.name ?? 'Unassigned'}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    Joined {formatDashboardDate(employee.joiningDate)}
                  </p>
                </div>
                <Badge variant="default">{formatUpcomingAnniversaryBadge(employee)}</Badge>
              </div>
            ))}
            {totalPages > 1 ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                itemLabel="anniversaries"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}