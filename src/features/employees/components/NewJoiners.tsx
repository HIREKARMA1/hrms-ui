import { UserPlus } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

import { newJoiners } from '../mocks/employeeDashboard.mock'

export function NewJoiners() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand-500" />
          New Joiners
        </CardTitle>
        <CardDescription>Recently joined employees</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Joining Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newJoiners.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.employeeId}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {employee.department}
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
