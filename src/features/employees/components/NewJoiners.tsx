import { UserPlus } from 'lucide-react'

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
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetNewJoinersQuery } from '../api/employeeDashboardApi'
import {
  formatDashboardDate,
  initialsFromName,
} from '../utils/dashboardDateRange'

export function NewJoiners() {
  const { data, isLoading, isError, error } = useGetNewJoinersQuery({
    page: 1,
    limit: 10,
  })
  const items = data?.items ?? []

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand-500" />
          New Joiners
        </CardTitle>
        <CardDescription>
          Joined this month
          {data ? ` (${data.pagination.total})` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load new joiners.')}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-secondary">No new joiners this month.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joining Date</TableHead>
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
                  <TableCell className="text-text-secondary">
                    {employee.employeeCode}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {employee.department?.name ?? 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDashboardDate(employee.dateOfJoining)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
