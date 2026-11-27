/**
<<<<<<< HEAD
 * HR Admin dashboard — workforce stats and live department / attendance APIs.
 */

import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { AttendanceAnalytics } from '@/features/employees/components/AttendanceAnalytics'
import { DepartmentDistribution } from '@/features/employees/components/DepartmentDistribution'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Admin Dashboard</h1>
      </div>
=======
 * HR Admin dashboard — Premium Teal & Navy, live /dashboard and recruitment APIs.
 */
import {
  Building2,
  Briefcase,
  CalendarDays,
  ClipboardList,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { getUserDisplayName } from '@/features/auth/utils/authUser'
import { useGetDashboardSummaryQuery } from '@/features/dashboard/api/dashboardApi'
import {
  DashboardChartCard,
  DashboardEmptyState,
  DashboardStatCard,
  DashboardStatSkeletonGrid,
  DASH_CHART_COLORS,
  DASH_CHART_TOOLTIP,
  DASH_SHELL,
  QuickActionCard,
  WelcomeSection,
} from '@/features/dashboard/components/shared'
import { useShouldFetchDashboardSummary } from '@/features/dashboard/hooks/useShouldFetchDashboardSummary'
import {
  useGetAttendanceAnalyticsQuery,
  useGetEmployeesByDepartmentQuery,
  useGetLateArrivalsTodayQuery,
  useGetLeaveAnalyticsQuery,
  useGetNewJoinersQuery,
  useGetOnLeaveTodayQuery,
  useGetPresentTodayQuery,
  useGetAbsentTodayQuery,
  useGetUpcomingAnniversariesQuery,
  useGetUpcomingBirthdaysQuery,
} from '@/features/employees/api/employeeDashboardApi'
import { useGetDashboardOverviewQuery } from '@/features/recruitment/api/analyticsApi'
import { getApiErrorMessage } from '@/services/api/errors'

function monthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: iso(start), endDate: iso(end) }
}

export function AdminDashboardPage() {
  const { user } = useAuthenticatedUser()
  const displayName = user ? getUserDisplayName(user) : 'HR Admin'
  const shouldFetchSummary = useShouldFetchDashboardSummary()
  const range = monthRange()

  const summary = useGetDashboardSummaryQuery(undefined, { skip: !shouldFetchSummary })
  const present = useGetPresentTodayQuery({ page: 1, limit: 1 })
  const absent = useGetAbsentTodayQuery({ page: 1, limit: 1 })
  const onLeave = useGetOnLeaveTodayQuery({ page: 1, limit: 1 })
  const late = useGetLateArrivalsTodayQuery({ page: 1, limit: 1 })
  const joiners = useGetNewJoinersQuery({ page: 1, limit: 5 })
  const byDept = useGetEmployeesByDepartmentQuery({})
  const attendanceAnalytics = useGetAttendanceAnalyticsQuery(range)
  const leaveAnalytics = useGetLeaveAnalyticsQuery(range)
  const birthdays = useGetUpcomingBirthdaysQuery({ page: 1, limit: 5, days: 30 })
  const anniversaries = useGetUpcomingAnniversariesQuery({ page: 1, limit: 5, days: 30 })
  const recruitment = useGetDashboardOverviewQuery()

  const s = summary.data
  const statsLoading = shouldFetchSummary && summary.isLoading

  const deptChart =
    byDept.data?.items
      ?.filter((d) => d.employeeCount > 0)
      .map((d) => ({
        name: d.departmentName || 'Unassigned',
        value: d.employeeCount,
      })) ?? []

  const attendanceSeries =
    attendanceAnalytics.data?.series?.slice(-14).map((point) => ({
      label: point.date.slice(5),
      present: point.present,
      absent: point.absent,
      late: point.late,
    })) ?? []

  return (
    <div className={DASH_SHELL}>
      <WelcomeSection
        title={`Welcome Back, ${displayName}`}
        subtitle="Here's what's happening across your organization."
      />
>>>>>>> 33ad27b66df81f3d80d7e33cbcd086b6bde59b7b

      {statsLoading ? (
        <DashboardStatSkeletonGrid count={8} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Total Employees"
            value={s?.totalEmployees ?? '—'}
            icon={Users}
            hint={summary.isError ? getApiErrorMessage(summary.error, 'Summary unavailable') : undefined}
          />
          <DashboardStatCard label="Active Employees" value={s?.activeEmployees ?? '—'} icon={Users} />
          <DashboardStatCard label="Inactive Employees" value={s?.inactiveEmployees ?? '—'} icon={Users} />
          <DashboardStatCard
            label="Present Today"
            value={present.data?.pagination.total ?? '—'}
            icon={ClipboardList}
            hint={present.isError ? getApiErrorMessage(present.error, 'Unavailable') : undefined}
          />
          <DashboardStatCard
            label="Absent Today"
            value={absent.data?.pagination.total ?? '—'}
            icon={ClipboardList}
          />
          <DashboardStatCard
            label="Employees on Leave"
            value={onLeave.data?.pagination.total ?? s?.onLeaveEmployees ?? '—'}
            icon={CalendarDays}
          />
          <DashboardStatCard
            label="Late Arrivals"
            value={late.data?.pagination.total ?? '—'}
            icon={ClipboardList}
          />
          <DashboardStatCard
            label="New Joiners"
            value={joiners.data?.pagination.total ?? '—'}
            icon={UserPlus}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
<<<<<<< HEAD
        <AttendanceAnalytics />
        <DepartmentDistribution />
      </div>
    </div>
  )
}
=======
        <DashboardChartCard
          title="Attendance Analytics"
          description="Daily present / absent / late from GET /dashboard/analytics/attendance."
        >
          {attendanceAnalytics.isError ? (
            <DashboardEmptyState
              title="Attendance analytics unavailable"
              description={getApiErrorMessage(attendanceAnalytics.error, 'API error')}
            />
          ) : attendanceSeries.length === 0 ? (
            <DashboardEmptyState title="No attendance analytics for this period" />
          ) : (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis dataKey="label" tick={{ fill: '#667085', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#667085', fontSize: 11 }} />
                  <Tooltip contentStyle={DASH_CHART_TOOLTIP} />
                  <Bar dataKey="present" name="Present" fill="#0F766E" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="absent" name="Absent" fill="#17213A" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="late" name="Late" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Employee Distribution"
          description="Department headcount from GET /dashboard/employees/by-department."
        >
          {byDept.isError ? (
            <DashboardEmptyState
              title="Department distribution unavailable"
              description={getApiErrorMessage(byDept.error, 'API error')}
            />
          ) : deptChart.length === 0 ? (
            <DashboardEmptyState title="No department distribution data" />
          ) : (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {deptChart.map((_, index) => (
                      <Cell key={index} fill={DASH_CHART_COLORS[index % DASH_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={DASH_CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardChartCard
          title="Leave Analytics"
          description="Request status summary for the current month."
        >
          {leaveAnalytics.isError ? (
            <DashboardEmptyState
              title="Leave analytics unavailable"
              description={getApiErrorMessage(leaveAnalytics.error, 'API error')}
            />
          ) : !leaveAnalytics.data || leaveAnalytics.data.empty ? (
            <DashboardEmptyState title="No leave analytics for this period" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Pending', leaveAnalytics.data.summary.pending],
                ['Approved', leaveAnalytics.data.summary.approved],
                ['Rejected', leaveAnalytics.data.summary.rejected],
                ['Total', leaveAnalytics.data.summary.totalLeaveRequests],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-[#E2E6EF] bg-[#F7F8FC] p-4">
                  <p className="text-xs text-[#667085]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#17213A]">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Recruitment Overview"
          description="From GET /recruitment/dashboard/overview."
        >
          {recruitment.isError ? (
            <DashboardEmptyState
              title="Recruitment overview unavailable"
              description={getApiErrorMessage(recruitment.error, 'API error')}
            />
          ) : !recruitment.data ? (
            <DashboardEmptyState title="No recruitment overview data" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['Open Jobs', recruitment.data.openJobs],
                ['Candidates', recruitment.data.totalCandidates],
                ['Applications', recruitment.data.totalApplications],
                ['Interviews', recruitment.data.interviewsScheduled],
                ['Offers', recruitment.data.offersReleased],
                ['Joined', recruitment.data.joined],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-[#E2E6EF] bg-[#F0FDFA] p-4">
                  <p className="text-xs text-[#667085]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#0F766E]">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardChartCard title="Upcoming Birthdays" description="Next 30 days.">
          {birthdays.isError ? (
            <DashboardEmptyState title="Birthdays unavailable" />
          ) : !(birthdays.data?.items?.length) ? (
            <DashboardEmptyState title="No upcoming birthdays" />
          ) : (
            <ul className="space-y-2">
              {birthdays.data.items.map((row) => (
                <li key={row.employeeId} className="flex justify-between text-sm">
                  <span className="font-medium text-[#17213A]">{row.employeeName}</span>
                  <span className="text-[#667085]">{row.upcomingBirthday}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>

        <DashboardChartCard title="Work Anniversaries" description="Next 30 days.">
          {anniversaries.isError ? (
            <DashboardEmptyState title="Anniversaries unavailable" />
          ) : !(anniversaries.data?.items?.length) ? (
            <DashboardEmptyState title="No upcoming anniversaries" />
          ) : (
            <ul className="space-y-2">
              {anniversaries.data.items.map((row) => (
                <li key={row.employeeId} className="flex justify-between text-sm">
                  <span className="font-medium text-[#17213A]">{row.employeeName}</span>
                  <span className="text-[#667085]">{row.upcomingAnniversary}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>

        <DashboardChartCard title="New Joiners" description="Recent hires.">
          {joiners.isError ? (
            <DashboardEmptyState title="New joiners unavailable" />
          ) : !(joiners.data?.items?.length) ? (
            <DashboardEmptyState title="No new joiners listed" />
          ) : (
            <ul className="space-y-2">
              {joiners.data.items.map((row) => (
                <li key={row.employeeId} className="flex justify-between text-sm">
                  <span className="font-medium text-[#17213A]">{row.employeeName}</span>
                  <span className="text-[#667085]">{row.dateOfJoining}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>
      </div>

      <DashboardChartCard
        title="Payroll Overview"
        description="Payroll RTK Query endpoints are not available in this frontend."
      >
        <DashboardEmptyState
          title="Payroll data unavailable"
          description="No production payroll API client is wired. Do not display fabricated payroll metrics."
        />
      </DashboardChartCard>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#17213A]">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard title="Add Employee" icon={UserPlus} to="/hradmin/employees/add" description="Registration" />
          <QuickActionCard title="Create Job" icon={Briefcase} to="/hradmin/recruitment/jobs" description="Job postings" />
          <QuickActionCard title="Manage Departments" icon={Building2} to="/hradmin/departments" description="Organization" />
          <QuickActionCard title="Review Leave" icon={CalendarDays} to="/hradmin/leave" description="Leave management" />
          <QuickActionCard title="View Attendance" icon={ClipboardList} to="/hradmin/attendance" description="Attendance module" />
          <QuickActionCard title="Recruitment" icon={Briefcase} to="/hradmin/recruitment" description="ATS overview" />
          <QuickActionCard title="Employees" icon={Users} to="/hradmin/employees" description="Workforce" />
          <Button asChild variant="outline" className="h-auto justify-start rounded-2xl border-[#E2E6EF] p-4">
            <Link to="/hradmin/employees/directory">Employee directory</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
>>>>>>> 33ad27b66df81f3d80d7e33cbcd086b6bde59b7b
