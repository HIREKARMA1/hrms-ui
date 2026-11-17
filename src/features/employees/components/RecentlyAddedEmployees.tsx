import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { recentlyAddedEmployees } from '../mocks/employeeDashboard.mock'

export function RecentlyAddedEmployees() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Recently Added Employees</CardTitle>
        <CardDescription>Latest hires added to the employee directory</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentlyAddedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-navy">{employee.name}</p>
                      <p className="text-xs text-text-secondary">
                        {employee.employeeId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.department}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{employee.employmentType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      employee.status === 'Probation' ? 'warning' : 'success'
                    }
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.joiningDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
