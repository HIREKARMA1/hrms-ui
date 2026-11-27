/**
 * Employee self-service dashboard — Premium Teal & Navy.
 * Live APIs only; unavailable metrics show empty states (no fabricated stats).
 */
import {
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  Palmtree,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { getUserDisplayName } from '@/features/auth/utils/authUser'
import {
  DashboardChartCard,
  DashboardEmptyState,
  DashboardStatCard,
  DashboardStatSkeletonGrid,
  DASH_SHELL,
  QuickActionCard,
  WelcomeSection,
} from '@/features/dashboard/components/shared'
import { useGetHolidaysQuery } from '@/features/leave/api/holidaysApi'
import { useGetLeaveBalanceQuery, useGetLeaveHistoryQuery } from '@/features/leave/api/leaveApi'
import { JOBS_PAGE_SIZE, useListJobsQuery } from '@/features/recruitment/api/jobsApi'
import { Feature } from '@/features/rbac/components/Feature'
import { getApiErrorMessage } from '@/services/api/errors'

function formatBalanceTotal(
  items: Array<{ availableLeaves?: number | null }> | undefined,
) {
  if (!items?.length) return null
  return items.reduce((sum, row) => sum + (row.availableLeaves ?? 0), 0)
}

export function EmployeeDashboardPage() {
  const { user } = useAuthenticatedUser()
  const displayName = user ? getUserDisplayName(user) : 'Employee'
  const employeeId = user?.employeeId?.trim() || ''
  const year = new Date().getFullYear()

  const balance = useGetLeaveBalanceQuery(
    { employeeId, year },
    { skip: !employeeId },
  )
  const leaveHistory = useGetLeaveHistoryQuery(
    { employeeId, page: 1, limit: 5 },
    { skip: !employeeId },
  )
  const holidays = useGetHolidaysQuery({ year })
  const jobs = useListJobsQuery({
    page: 1,
    limit: JOBS_PAGE_SIZE,
    status: 'PUBLISHED',
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const leaveRemaining = formatBalanceTotal(balance.data?.items)
  const pendingLeaves =
    leaveHistory.data?.items?.filter((item) => item.status === 'Pending').length ?? null
  const todayIso = new Date().toISOString().slice(0, 10)
  const upcomingHolidays = (holidays.data?.items ?? [])
    .map((h) => ({
      id: h.id,
      name: h.name ?? h.title ?? 'Holiday',
      date: h.date ?? h.holidayDate ?? '',
    }))
    .filter((h) => h.date && h.date >= todayIso)
    .slice(0, 5)
  const openJobs = jobs.data?.items?.slice(0, 4) ?? []

  return (
    <div className={DASH_SHELL}>
      <WelcomeSection
        title={`Welcome Back, ${displayName}`}
        subtitle="Here's your personal workspace overview."
      />

      {!employeeId ? (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Your login is not linked to an employee record, so leave balance and personal leave history
          cannot be loaded yet.
        </p>
      ) : null}

      {balance.isLoading || leaveHistory.isLoading || holidays.isLoading ? (
        <DashboardStatSkeletonGrid count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Attendance Today"
            value="—"
            icon={Clock}
            hint="Open Check In / My Attendance for live punch status."
          />
          <DashboardStatCard
            label="Leave Balance"
            value={leaveRemaining === null ? '—' : leaveRemaining}
            icon={Palmtree}
            hint={
              balance.isError
                ? getApiErrorMessage(balance.error, 'Could not load leave balance.')
                : employeeId
                  ? 'Remaining days across leave types'
                  : 'Requires linked employeeId'
            }
          />
          <DashboardStatCard
            label="Pending Leave Requests"
            value={pendingLeaves === null ? '—' : pendingLeaves}
            icon={FileText}
            hint={
              leaveHistory.isError
                ? getApiErrorMessage(leaveHistory.error, 'Could not load leave history.')
                : 'From your recent leave history'
            }
          />
          <DashboardStatCard
            label="Upcoming Holidays"
            value={holidays.isError ? '—' : upcomingHolidays.length}
            icon={CalendarDays}
            hint={
              holidays.isError
                ? getApiErrorMessage(holidays.error, 'Could not load holidays.')
                : `${year} holiday calendar`
            }
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="leave.myLeave">
          <DashboardChartCard
            title="My Leave"
            description="Recent leave requests from the leave API."
            action={
              <Button asChild size="sm" className="bg-[#0F766E] hover:bg-[#115E59]">
                <Link to="/employee/leave">Apply Leave</Link>
              </Button>
            }
          >
            {!employeeId ? (
              <DashboardEmptyState
                title="Employee record required"
                description="Leave history needs a linked employeeId on your account."
              />
            ) : leaveHistory.isError ? (
              <DashboardEmptyState
                title="Could not load leave history"
                description={getApiErrorMessage(leaveHistory.error, 'Try again from Leave Management.')}
              />
            ) : !(leaveHistory.data?.items?.length) ? (
              <DashboardEmptyState title="No leave requests yet" />
            ) : (
              <ul className="space-y-3">
                {leaveHistory.data.items.slice(0, 5).map((leave) => (
                  <li
                    key={leave.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E6EF] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#17213A]">
                        {leave.leaveTypeCode || 'Leave'}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {leave.fromDate}
                        {leave.toDate ? ` – ${leave.toDate}` : ''}
                      </p>
                    </div>
                    <Badge variant="secondary">{leave.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </DashboardChartCard>
        </Feature>

        <Feature name="attendance.holidays">
          <DashboardChartCard
            title="Upcoming Holidays"
            description="From the organization holiday calendar."
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/employee/holidays">View all</Link>
              </Button>
            }
          >
            {holidays.isError ? (
              <DashboardEmptyState
                title="Could not load holidays"
                description={getApiErrorMessage(holidays.error, 'Retry from Company Holidays.')}
              />
            ) : upcomingHolidays.length === 0 ? (
              <DashboardEmptyState title="No upcoming holidays in this year’s list" />
            ) : (
              <ul className="space-y-3">
                {upcomingHolidays.map((holiday) => (
                  <li
                    key={`${holiday.id ?? holiday.name}-${holiday.date}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#F0FDFA] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-[#17213A]">{holiday.name}</p>
                    <p className="text-xs text-[#667085]">{holiday.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </DashboardChartCard>
        </Feature>
      </div>

      <Feature name="recruitment.jobs">
        <DashboardChartCard
          title="Internal Job Opportunities"
          description="Published active openings from recruitment."
          action={
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/employee/recruitment/applications">My Applications</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#0F766E] hover:bg-[#115E59]">
                <Link to="/employee/recruitment/jobs">Browse jobs</Link>
              </Button>
            </div>
          }
        >
          {jobs.isError ? (
            <DashboardEmptyState
              title="Could not load jobs"
              description={getApiErrorMessage(jobs.error, 'Retry from Internal Jobs.')}
            />
          ) : openJobs.length === 0 ? (
            <DashboardEmptyState title="No published internal jobs right now" />
          ) : (
            <ul className="space-y-3">
              {openJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-col gap-2 rounded-xl border border-[#E2E6EF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#17213A]">{job.title}</p>
                    <p className="text-xs text-[#667085]">
                      {job.department?.name ?? 'Department TBA'} · {job.location}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/employee/recruitment/jobs">Apply Now</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>
      </Feature>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#17213A]">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="Check In / Out"
            description="Record today’s attendance"
            icon={Clock}
            to="/employee/check-in"
          />
          <QuickActionCard
            title="My Attendance"
            description="View attendance history"
            icon={CalendarDays}
            to="/employee/attendance"
          />
          <QuickActionCard
            title="My Profile"
            description="Employee profile details"
            icon={UserRound}
            to="/employee/profile"
          />
          <QuickActionCard
            title="Internal Jobs"
            description="Browse openings"
            icon={Briefcase}
            to="/employee/recruitment/jobs"
          />
        </div>
      </div>

      <DashboardChartCard
        title="My Payroll"
        description="Payslip APIs are not available in the current frontend RTK client."
      >
        <DashboardEmptyState
          title="Payroll data unavailable"
          description="No production payroll RTK Query endpoints are wired. Use Payroll Management when available."
        />
      </DashboardChartCard>
    </div>
  )
}

export default EmployeeDashboardPage
