import { CalendarDays, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  ApprovalStatusBadge,
  AttendanceStatusBadge,
} from '@/features/attendance/components/AttendanceStatusBadge'
import type { AttendanceStatus } from '@/features/attendance/types/attendance'
import { LeaveEmployeeLinkNotice } from '@/features/leave/components/shared/LeaveEmployeeLinkNotice'
import type { LeaveRequestStatus } from '@/features/leave/types/leaveRequest'
import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { useEmployeeDashboardData } from '../hooks/useEmployeeDashboardData'

function DashboardInlineError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
      <span>{message}</span>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="ml-3 h-8" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}

function DashboardLoading({ label }: { label: string }) {
  return <p className="text-sm text-text-secondary">{label}</p>
}

function DashboardEmpty({ message }: { message: string }) {
  return <p className="text-sm text-text-secondary">{message}</p>
}

function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  if (status === 'Approved' || status === 'Rejected' || status === 'Pending') {
    return <ApprovalStatusBadge status={status} />
  }
  return <Badge variant="secondary">{status}</Badge>
}

export function EmployeeDashboardPage() {
  const data = useEmployeeDashboardData()

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">My Dashboard</h1>
      </div>

      {!data.linked && data.canLeave ? <LeaveEmployeeLinkNotice /> : null}

      {data.stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.stats.map((stat) => (
            <Card key={stat.id} className="border-border-soft shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DashboardEmpty message="No summary metrics available for your role." />
      )}

      {data.canMyAttendance ? (
        <Card className="border-border-soft shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-navy">My recent attendance</CardTitle>
              <CardDescription>Last few working days</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/employee/attendance">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attendanceError ? (
              <DashboardInlineError message={data.attendanceError} onRetry={data.refetchAttendance} />
            ) : data.attendanceLoading ? (
              <DashboardLoading label="Loading your attendance…" />
            ) : data.recentAttendance.length === 0 ? (
              <DashboardEmpty message="No attendance records in the last few days." />
            ) : (
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
                  {data.recentAttendance.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium text-navy">{row.date}</TableCell>
                      <TableCell className="text-text-secondary">{row.checkIn}</TableCell>
                      <TableCell className="text-text-secondary">{row.checkOut}</TableCell>
                      <TableCell className="text-right">
                        <AttendanceStatusBadge status={row.status as AttendanceStatus} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="leave.myLeave">
          <Card className="border-border-soft shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-navy">Leave history</CardTitle>
                <CardDescription>Your recent leave applications</CardDescription>
              </div>
              {data.linked ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/employee/leave">View all</Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {!data.linked ? (
                <LeaveEmployeeLinkNotice />
              ) : data.leaveError ? (
                <DashboardInlineError message={data.leaveError} onRetry={data.refetchLeave} />
              ) : data.leaveLoading ? (
                <DashboardLoading label="Loading leave history…" />
              ) : data.leaveRows.length === 0 ? (
                <DashboardEmpty message="No leave applications yet." />
              ) : (
                <ul className="space-y-3">
                  {data.leaveRows.map((leave) => (
                    <li
                      key={leave.key}
                      className="flex flex-col gap-2 rounded-xl border border-border-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-navy">{leave.typeLabel}</p>
                        <p className="text-xs text-text-secondary">{leave.dateRange}</p>
                      </div>
                      <LeaveStatusBadge status={leave.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Feature>

        <Feature name="attendance.holidays">
          <Card className="border-border-soft shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-navy">
                <CalendarDays className="h-5 w-5 text-brand-500" />
                Upcoming holidays
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/employee/holidays">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.holidaysError ? (
                <DashboardInlineError message={data.holidaysError} onRetry={data.refetchHolidays} />
              ) : data.holidaysLoading ? (
                <DashboardLoading label="Loading holidays…" />
              ) : data.holidayRows.length === 0 ? (
                <DashboardEmpty message="No upcoming holidays on the company calendar." />
              ) : (
                <ul className="space-y-3">
                  {data.holidayRows.map((holiday) => (
                    <li
                      key={holiday.key}
                      className="flex items-center justify-between gap-3 rounded-xl bg-lavender/60 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-navy">{holiday.name}</span>
                      <span className="text-xs text-text-secondary">{holiday.date}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Feature>
      </div>

      {data.canAnnouncements ? (
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy">
              <Megaphone className="h-5 w-5 text-brand-500" />
              Announcements
            </CardTitle>
            <CardDescription>Updates relevant to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.announcementsError ? (
              <DashboardInlineError message={data.announcementsError} onRetry={data.refetchAnnouncements} />
            ) : data.announcementsLoading ? (
              <DashboardLoading label="Loading announcements…" />
            ) : data.announcements.length === 0 ? (
              <DashboardEmpty message="No upcoming announcements." />
            ) : (
              <ul className="divide-y divide-border-soft">
                {data.announcements.map((item) => (
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
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}