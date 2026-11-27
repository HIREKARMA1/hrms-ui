/**
 * Manager dashboard — Premium Teal & Navy.
 * Uses live workforce summary, attendance counts, leave approvals, and internal jobs.
 */
import {
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { getUserDisplayName } from '@/features/auth/utils/authUser'
import { useGetDashboardSummaryQuery } from '../api/dashboardApi'
import {
  DashboardChartCard,
  DashboardEmptyState,
  DashboardStatCard,
  DashboardStatSkeletonGrid,
  DASH_SHELL,
  QuickActionCard,
  WelcomeSection,
} from '../components/shared'
import { useShouldFetchDashboardSummary } from '../hooks/useShouldFetchDashboardSummary'
import {
  useGetAbsentTodayQuery,
  useGetOnLeaveTodayQuery,
  useGetPresentTodayQuery,
  useGetUpcomingAnniversariesQuery,
  useGetUpcomingBirthdaysQuery,
} from '@/features/employees/api/employeeDashboardApi'
import { useGetPendingApprovalsQuery } from '@/features/leave/api/leaveApprovalApi'
import { JOBS_PAGE_SIZE, useListJobsQuery } from '@/features/recruitment/api/jobsApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { UpcomingEvents } from '../components/UpcomingEvents'

type DashboardPageProps = {
  /** When true, loads org workforce summary (Manager workspace). */
  showWorkforceSummary?: boolean
}

export function DashboardPage({ showWorkforceSummary = false }: DashboardPageProps) {
  const { user } = useAuthenticatedUser()
  const displayName = user ? getUserDisplayName(user) : 'Manager'
  const shouldFetchSummary = useShouldFetchDashboardSummary() && showWorkforceSummary

  const summary = useGetDashboardSummaryQuery(undefined, { skip: !shouldFetchSummary })
  const present = useGetPresentTodayQuery({ page: 1, limit: 1 }, { skip: !showWorkforceSummary })
  const absent = useGetAbsentTodayQuery({ page: 1, limit: 1 }, { skip: !showWorkforceSummary })
  const onLeave = useGetOnLeaveTodayQuery({ page: 1, limit: 1 }, { skip: !showWorkforceSummary })
  const approvals = useGetPendingApprovalsQuery(undefined, { skip: !showWorkforceSummary })
  const birthdays = useGetUpcomingBirthdaysQuery(
    { page: 1, limit: 5, days: 30 },
    { skip: !showWorkforceSummary },
  )
  const anniversaries = useGetUpcomingAnniversariesQuery(
    { page: 1, limit: 5, days: 30 },
    { skip: !showWorkforceSummary },
  )
  const jobs = useListJobsQuery(
    {
      page: 1,
      limit: JOBS_PAGE_SIZE,
      status: 'PUBLISHED',
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { skip: !showWorkforceSummary },
  )

  const presentCount = present.data?.pagination.total
  const absentCount = absent.data?.pagination.total
  const onLeaveCount = onLeave.data?.pagination.total ?? summary.data?.onLeaveEmployees
  const teamTotal = summary.data?.activeEmployees
  const attendanceRate =
    typeof presentCount === 'number' &&
    typeof teamTotal === 'number' &&
    teamTotal > 0
      ? `${Math.round((presentCount / teamTotal) * 100)}%`
      : '—'

  const pendingList = approvals.data ?? []

  if (!showWorkforceSummary) {
    return (
      <div className={DASH_SHELL}>
        <WelcomeSection
          title="Dashboard"
          subtitle="Overview of your organization HR operations."
        />
        <DashboardEmptyState
          title="Workforce summary not enabled on this route"
          description="Open the Manager workspace dashboard for live team metrics."
        />
      </div>
    )
  }

  return (
    <div className={DASH_SHELL}>
      <WelcomeSection
        title={`Welcome Back, ${displayName}`}
        subtitle="Here's your team overview and pending activities."
      />

      {shouldFetchSummary && summary.isLoading ? (
        <DashboardStatSkeletonGrid count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardStatCard
            label="Total Team Members"
            value={teamTotal ?? '—'}
            icon={Users}
            hint="Active employees from organization summary"
          />
          <DashboardStatCard label="Present Today" value={presentCount ?? '—'} icon={ClipboardList} />
          <DashboardStatCard label="Absent Today" value={absentCount ?? '—'} icon={ClipboardList} />
          <DashboardStatCard label="Team Members on Leave" value={onLeaveCount ?? '—'} icon={CalendarDays} />
          <DashboardStatCard
            label="Pending Leave Approvals"
            value={Array.isArray(pendingList) ? pendingList.length : '—'}
            icon={ClipboardCheck}
            hint={
              approvals.isError
                ? getApiErrorMessage(approvals.error, 'Approvals unavailable')
                : undefined
            }
          />
          <DashboardStatCard
            label="Team Attendance Rate"
            value={attendanceRate}
            icon={ClipboardList}
            hint="Present today ÷ active employees (when both available)"
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardChartCard
          title="Leave Approvals"
          description="Pending items from leave approval API."
          action={
            <Button asChild size="sm" className="bg-[#0F766E] hover:bg-[#115E59]">
              <Link to="/manager/leave">Open leave</Link>
            </Button>
          }
        >
          {approvals.isError ? (
            <DashboardEmptyState
              title="Could not load pending approvals"
              description={getApiErrorMessage(approvals.error, 'API error')}
            />
          ) : pendingList.length === 0 ? (
            <DashboardEmptyState title="No pending leave approvals" />
          ) : (
            <ul className="space-y-3">
              {pendingList.slice(0, 6).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E6EF] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#17213A]">
                      {row.employeeName ?? 'Employee'}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {row.leaveTypeCode || 'Leave'} · {row.fromDate}
                      {row.toDate ? ` – ${row.toDate}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{row.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </DashboardChartCard>

        <UpcomingEvents />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardChartCard title="Team Birthdays" description="Next 30 days.">
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
      </div>

      <DashboardChartCard
        title="Internal Jobs"
        description="Published openings managers can view and apply to."
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/manager/recruitment/jobs">Browse jobs</Link>
          </Button>
        }
      >
        {jobs.isError ? (
          <DashboardEmptyState
            title="Could not load jobs"
            description={getApiErrorMessage(jobs.error, 'API error')}
          />
        ) : !(jobs.data?.items?.length) ? (
          <DashboardEmptyState title="No published internal jobs" />
        ) : (
          <ul className="space-y-3">
            {jobs.data.items.slice(0, 4).map((job) => (
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
                  <Link to="/manager/recruitment/jobs">View</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DashboardChartCard>

      <DashboardChartCard
        title="Team Performance"
        description="No dedicated performance API is available in the current frontend."
      >
        <DashboardEmptyState
          title="Performance data unavailable"
          description="Do not display fabricated performance scores until a backend contract exists."
        />
      </DashboardChartCard>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#17213A]">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard title="View My Team" icon={Users} to="/manager/employees/directory" />
          <QuickActionCard title="Review Attendance" icon={ClipboardList} to="/manager/attendance" />
          <QuickActionCard title="Approve Leave" icon={ClipboardCheck} to="/manager/leave" />
          <QuickActionCard title="Internal Jobs" icon={Briefcase} to="/manager/recruitment/jobs" />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
