import { Cake } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { upcomingBirthdays } from '../mocks/employeeDashboard.mock'

export function UpcomingBirthdays() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-4 w-4 text-brand-500" />
          Upcoming Birthdays
        </CardTitle>
        <CardDescription>Employees celebrating soon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingBirthdays.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center gap-3 rounded-xl border border-border-soft bg-muted-bg/40 p-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{employee.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy">{employee.name}</p>
              <p className="truncate text-xs text-text-secondary">
                {employee.department}
              </p>
            </div>
            <Badge variant="secondary">{employee.birthdayDate}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
