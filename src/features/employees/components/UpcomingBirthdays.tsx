/**
 * GET /dashboard/employees/upcoming-birthdays — windowed list with filters.
 */

import { Cake } from 'lucide-react'
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

import { useGetUpcomingBirthdaysQuery } from '../api/employeeDashboardApi'
import { initialsFromName } from '../utils/dashboardDateRange'
import {
  formatUpcomingBirthdayBadge,
  formatUpcomingBirthdaysSubtitle,
} from '../utils/formatUpcomingBirthdayCaption'
import { UpcomingMilestoneFilters } from './UpcomingMilestoneFilters'

const PAGE_SIZE = 8

export function UpcomingBirthdays() {
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
    useGetUpcomingBirthdaysQuery(queryArgs)

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? 1
  const subtitle = isLoading
    ? 'Loading upcoming birthdays…'
    : formatUpcomingBirthdaysSubtitle(data)

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-brand-500" />
            Upcoming Birthdays
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
          searchAriaLabel="Search upcoming birthdays"
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load upcoming birthdays.')}
          </p>
        ) : data?.empty === true || items.length === 0 ? (
          <DashboardLiveEmpty
            title="No upcoming birthdays"
            description="No employees have a birthday in this window with the current filters."
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
                </div>
                <Badge variant="secondary">{formatUpcomingBirthdayBadge(employee)}</Badge>
              </div>
            ))}
            {totalPages > 1 ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                itemLabel="birthdays"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}