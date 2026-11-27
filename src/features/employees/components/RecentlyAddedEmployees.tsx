/**
 * GET /dashboard/employees/recently-added — by Employee.createdAt.
 */

import { UserRoundPlus } from 'lucide-react'
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
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetRecentlyAddedEmployeesQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  formatDashboardDateTime,
  initialsFromName,
} from '../utils/dashboardDateRange'
import { formatEmploymentStatusLabel } from '../utils/formatNewJoinersCaption'
import { formatRecentlyAddedSubtitle } from '../utils/formatRecentlyAddedCaption'
import { RecentlyAddedFilters } from './RecentlyAddedFilters'

const PAGE_SIZE = 10

function statusBadgeVariant(status: string): 'success' | 'secondary' | 'warning' | 'default' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'PROBATION' || status === 'ON_LEAVE') return 'warning'
  if (status === 'TERMINATED') return 'secondary'
  return 'default'
}

export function RecentlyAddedEmployees() {
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
    useGetRecentlyAddedEmployeesQuery(queryArgs)

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? 1
  const subtitle = isLoading
    ? 'Loading recently added employees…'
    : formatRecentlyAddedSubtitle(data)

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <UserRoundPlus className="h-4 w-4 text-brand-500" />
            Recently Added
          </CardTitle>
          <CardDescription>
            {subtitle}
            {isFetching && !isLoading ? (
              <span className="text-text-secondary"> · Updating…</span>
            ) : null}
          </CardDescription>
        </div>
        <RecentlyAddedFilters
          days={days}
          onDaysChange={(value) => {
            setDays(value)
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
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load recently added employees.')}
          </p>
        ) : data?.empty === true || items.length === 0 ? (
          <DashboardLiveEmpty
            title="No recent additions"
            description="Nobody was added in this window with the current filters."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joining date</TableHead>
                  <TableHead>Created</TableHead>
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
                    <TableCell className="text-text-secondary">
                      {employee.designation?.trim() || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(employee.employmentStatus)}>
                        {formatEmploymentStatusLabel(employee.employmentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDashboardDate(employee.dateOfJoining)}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDashboardDateTime(employee.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 ? (
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                itemLabel="employees"
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}