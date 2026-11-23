import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  ApprovalStatusBadge,
  AttendanceStats,
  AttendanceStatusBadge,
  AttendanceTrendChart,
  DepartmentAttendanceChart,
} from '../components'
import {
  pendingCorrections,
  recentAttendanceActivity,
  todaySummary,
} from '../mocks/attendanceMocks'

export function AttendanceOverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Attendance Overview
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Real-time snapshot of attendance, trends, and pending corrections across
          your organization.
        </p>
      </div>

      <AttendanceStats />

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
          <CardDescription>Headcount breakdown for today</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {todaySummary.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-border-soft bg-muted-bg/50 px-4 py-3"
              >
                <span className="text-sm font-medium text-text-secondary">
                  {item.label}
                </span>
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceTrendChart />
        <DepartmentAttendanceChart />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="h-full border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle>Recent Attendance Activity</CardTitle>
            <CardDescription>Latest check-ins and statuses for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-soft text-text-secondary">
                    <th className="pb-3 pr-3 font-medium">Employee</th>
                    <th className="pb-3 pr-3 font-medium">Check-in</th>
                    <th className="pb-3 pr-3 font-medium">Check-out</th>
                    <th className="pb-3 pr-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendanceActivity.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border-soft/60 last:border-0"
                    >
                      <td className="py-3 pr-3">
                        <p className="font-medium text-navy">{row.employeeName}</p>
                        <p className="text-xs text-text-secondary">{row.employeeId}</p>
                      </td>
                      <td className="py-3 pr-3 text-text-secondary">{row.checkIn}</td>
                      <td className="py-3 pr-3 text-text-secondary">{row.checkOut}</td>
                      <td className="py-3 pr-3 text-text-secondary">
                        {row.workingHours}
                      </td>
                      <td className="py-3">
                        <AttendanceStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle>Pending Corrections</CardTitle>
            <CardDescription>Correction requests awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pendingCorrections.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border-soft bg-muted-bg/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {item.employeeName}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Requested {item.requestDate}
                      </p>
                    </div>
                    <ApprovalStatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{item.reason}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AttendanceOverviewPage
