import { Hourglass } from 'lucide-react'

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

import { noticePeriodEmployees } from '../mocks/employeeDashboard.mock'

export function NoticePeriodEmployees() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 text-brand-500" />
          Employees on Notice Period
        </CardTitle>
        <CardDescription>Current notice period workforce</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Notice Start</TableHead>
              <TableHead>Last Working Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noticePeriodEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-text-secondary">
                        {employee.employeeId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.department}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.noticeStartDate}
                </TableCell>
                <TableCell>
                  <Badge variant="warning">{employee.lastWorkingDate}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
