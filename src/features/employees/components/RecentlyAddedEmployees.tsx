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
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
import { getApiErrorMessage } from '@/services/api/errors'

import { useListEmployeesQuery } from '../api/employeesApi'
import { getQueryViewState } from '../utils/queryViewState'

const RECENT_COUNT = 5

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}

/** Newest employees from GET /employees (ordered by createdAt desc). */
export function RecentlyAddedEmployees() {
  const { canAccess } = useOptionalFeatureAccess()
  const allowed = canAccess('employee.directory')
  const { data, isLoading, isError, error } = useListEmployeesQuery(
    { skip: 0, take: RECENT_COUNT },
    { skip: !allowed },
  )
  const items = data?.items ?? []
  const viewState = getQueryViewState({
    isLoading,
    isError,
    hasData: Boolean(data),
    itemCount: items.length,
  })

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Recently Added Employees</CardTitle>
        <CardDescription>Latest employees added to the directory</CardDescription>
      </CardHeader>
      <CardContent>
        {!allowed ? (
          <p className="text-sm text-text-secondary">
            You need access to the employee directory to see recent additions.
          </p>
        ) : viewState === 'error' ? (
          <p className="text-sm text-rose-700">
            {getApiErrorMessage(error, 'Could not load recent employees.')}
          </p>
        ) : viewState === 'empty' ? (
          <p className="text-sm text-text-secondary">No employees have been added yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewState === 'loading'
                ? Array.from({ length: 3 }, (_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 5 }, (__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : items.map(({ profile, server }) => (
                    <TableRow key={server.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {initials(profile.firstName, profile.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-navy">
                              {profile.firstName} {profile.lastName}
                            </p>
                            <p className="text-xs text-text-secondary">{profile.employeeCode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {profile.department || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{profile.designation}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.employmentStatus === 'Active' ? 'success' : 'warning'}>
                          {profile.employmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {profile.dateOfJoining || '—'}
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
