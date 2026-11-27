/**
 * GET /dashboard/employees/terminated — paginated terminated list.
 */

import { UserX } from 'lucide-react'
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

import { useGetTerminatedEmployeesQuery } from '../api/employeeDashboardApi'
import { formatDashboardDate, initialsFromName } from '../utils/dashboardDateRange'
import { formatEmploymentStatusLabel } from '../utils/formatNewJoinersCaption'
import { formatTerminatedSubtitle } from '../utils/formatTerminatedCaption'
import { OnProbationFilters } from './OnProbationFilters'

const PAGE_SIZE = 10

export function TerminatedEmployees() {
  const [page, setPage] = useState(1)
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
      departmentId: departmentId === 'all' ? undefined : departmentId,
      search: search.trim() || undefined,
    }),
    [page, departmentId, search],
  )

  const { data, isLoading, isError, isFetching, error } = useGetTerminatedEmployeesQuery(queryArgs)

  const items = data?.items ?? []
  const total = data?.pagination.total ?? 0
  const totalPages = data?.pagination.totalPages ?? 1
  const subtitle = isLoading ? 'Loading terminated employees…' : formatTerminatedSubtitle(data)

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader className="gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-brand-500" />
            Terminated
          </CardTitle>
          <CardDescription>
            {subtitle}
            {isFetching && !isLoading ? (
              <span className="text-text-secondary"> · Updating…</span>
            ) : null}
          </CardDescription>
        </div>
        <OnProbationFilters
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
          searchAriaLabel="Search terminated employees"
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
            {getApiErrorMessage(error, 'Could not load terminated employees.')}
          </p>
        ) : data?.empty === true || items.length === 0 ? (
          <DashboardLiveEmpty
            title="No terminated employees"
            description="No employees match the current search or department filter."
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
                      <Badge variant="secondary">
                        {formatEmploymentStatusLabel(employee.employmentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDashboardDate(employee.dateOfJoining)}
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