import { CalendarDays, Megaphone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Feature } from '@/features/rbac/components/Feature'
import { employeeDashboardMock } from '@/features/rbac/mocks/rbacMocks'
import { cn } from '@/lib/utils'

function attendanceStatusVariant(status: string) {
  if (status === 'Present') return 'success' as const
  if (status === 'Late') return 'warning' as const
  return 'secondary' as const
}

function leaveStatusVariant(status: string) {
  if (status === 'Approved') return 'success' as const
  if (status === 'Pending') return 'warning' as const
  return 'secondary' as const
}

export function EmployeeDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">My Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Employee self-service</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employeeDashboardMock.stats.map((stat) => (
          <Card key={stat.id} className="border-border-soft shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">My recent attendance</CardTitle>
          <CardDescription>Last few working days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeDashboardMock.recentAttendance.map((row) => (
                <TableRow key={row.date}>
                  <TableCell className="font-medium text-navy">{row.date}</TableCell>
                  <TableCell className="text-text-secondary">{row.checkIn}</TableCell>
                  <TableCell className="text-text-secondary">{row.checkOut}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={attendanceStatusVariant(row.status)}>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="leave.myLeave">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Leave history</CardTitle>
            <CardDescription>Your recent leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {employeeDashboardMock.leaveHistory.map((leave) => (
                <li
                  key={`${leave.type}-${leave.dates}`}
                  className="flex flex-col gap-2 rounded-xl border border-border-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">{leave.type}</p>
                    <p className="text-xs text-text-secondary">{leave.dates}</p>
                  </div>
                  <Badge variant={leaveStatusVariant(leave.status)}>{leave.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        </Feature>

        <Feature name="attendance.holidays">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy">
              <CalendarDays className="h-5 w-5 text-brand-500" />
              Upcoming holidays
            </CardTitle>
            <CardDescription>Organization holiday calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {employeeDashboardMock.holidays.map((holiday) => (
                <li
                  key={holiday.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-lavender/60 px-4 py-3"
                >
                  <span className="text-sm font-medium text-navy">{holiday.name}</span>
                  <span className="text-xs text-text-secondary">{holiday.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        </Feature>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Megaphone className="h-5 w-5 text-brand-500" />
            Announcements
          </CardTitle>
          <CardDescription>Updates relevant to you</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border-soft">
            {employeeDashboardMock.announcements.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-1 py-4 first:pt-0 last:pb-0',
                  'sm:flex-row sm:items-start sm:justify-between',
                )}
              >
                <p className="text-sm font-medium text-navy">{item.title}</p>
                <span className="shrink-0 text-xs text-text-secondary">{item.date}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
