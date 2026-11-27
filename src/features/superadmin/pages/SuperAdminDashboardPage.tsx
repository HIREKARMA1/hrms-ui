/**
 * Super Admin dashboard — Premium Teal & Navy.
 * Live users/roles/departments + workforce summary + recruitment overview.
 */
import {
  Building2,
  Briefcase,
  KeyRound,
  Shield,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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
import { useGetEmployeesByDepartmentQuery } from '@/features/employees/api/employeeDashboardApi'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { useGetDashboardOverviewQuery } from '@/features/recruitment/api/analyticsApi'
import { Can } from '@/features/rbac/components/Can'
import { useListRolesQuery } from '@/features/roles/api/rolesApi'
import { useListUsersQuery } from '@/features/users/api/usersApi'
import { getApiErrorMessage } from '@/services/api/errors'

export function SuperAdminDashboardPage() {
  const { user } = useAuthenticatedUser()
  const displayName = user ? getUserDisplayName(user) : 'Super Admin'
  const shouldFetchSummary = useShouldFetchDashboardSummary()

  const summary = useGetDashboardSummaryQuery(undefined, { skip: !shouldFetchSummary })
  const users = useListUsersQuery({ page: 1, limit: 1 })
  const roles = useListRolesQuery({ page: 1, limit: 50 })
  const departments = useListDepartmentsQuery({
    page: 1,
    limit: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const byDept = useGetEmployeesByDepartmentQuery({})
  const recruitment = useGetDashboardOverviewQuery()

  const totalUsers = users.data?.pagination.total
  const activeUsers = users.data?.items?.filter((u) => u.isActive).length
  // Active count from page 1 only is incomplete — show total from pagination; active/inactive need filters.
  const roleItems = roles.data?.items ?? []
  const roleChart = roleItems
    .map((role) => ({
      name: role.code,
      value: role.userCount ?? 0,
    }))
    .filter((row) => row.value > 0)

  const deptChart =
    byDept.data?.items
      ?.filter((d) => d.employeeCount > 0)
      .map((d) => ({
        name: d.departmentName || 'Unassigned',
        value: d.employeeCount,
      })) ?? []

  return (
    <div className={DASH_SHELL}>
      <WelcomeSection
        title={`Welcome Back, ${displayName}`}
        subtitle="Monitor your HRMS organization and system-wide activities."
        trailing={
          <div className="flex flex-wrap gap-2">
            <Can>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/superadmin/roles">
                  <Shield className="h-4 w-4" />
                  Manage Roles
                </Link>
              </Button>
            </Can>
            <Can>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/superadmin/permissions">
                  <KeyRound className="h-4 w-4" />
                  Manage Permissions
                </Link>
              </Button>
            </Can>
            <Can>
              <Button asChild className="gap-2 bg-[#0F766E] hover:bg-[#115E59]">
                <Link to="/superadmin/users">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </Can>
          </div>
        }
      />

      {users.isLoading || summary.isLoading ? (
        <DashboardStatSkeletonGrid count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardStatCard
            label="Total Users"
            value={totalUsers ?? '—'}
            icon={Users}
            hint={users.isError ? getApiErrorMessage(users.error, 'Users unavailable') : undefined}
          />
          <DashboardStatCard
            label="Active Users (page sample)"
            value={activeUsers ?? '—'}
            icon={Users}
            hint="Active flag from the first users page only — not a full active count."
          />
          <DashboardStatCard
            label="Inactive Users"
            value="—"
            icon={Users}
            hint="No dedicated inactive-users total on GET /users without a full scan."
          />
          <DashboardStatCard
            label="Total Employees"
            value={summary.data?.totalEmployees ?? '—'}
            icon={Users}
            hint={
              summary.isError
                ? getApiErrorMessage(summary.error, 'Summary unavailable')
                : undefined
            }
          />
          <DashboardStatCard
            label="Total Departments"
            value={departments.data?.pagination.total ?? '—'}
            icon={Building2}
          />
          <DashboardStatCard
            label="Total Roles"
            value={roles.data?.pagination?.total ?? roleItems.length ?? '—'}
            icon={Shield}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardChartCard
          title="User Distribution by Role"
          description="Role userCount from GET /roles."
        >
          {roles.isError ? (
            <DashboardEmptyState
              title="Roles unavailable"
              description={getApiErrorMessage(roles.error, 'API error')}
            />
          ) : roleChart.length === 0 ? (
            <DashboardEmptyState title="No role user counts available" />
          ) : (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {roleChart.map((_, index) => (
                      <Cell key={index} fill={DASH_CHART_COLORS[index % DASH_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={DASH_CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Organization Overview"
          description="Employees by department."
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
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

      <DashboardChartCard
        title="System Activity / Audit"
        description="No dedicated audit-activity dashboard endpoint is wired for this page."
      >
        <DashboardEmptyState
          title="Audit feed unavailable"
          description="Use Audit module routes when authorized. Do not invent activity metrics."
        />
      </DashboardChartCard>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#17213A]">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard title="User Management" icon={Users} to="/superadmin/users" />
          <QuickActionCard title="Role Management" icon={Shield} to="/superadmin/roles" />
          <QuickActionCard title="Permission Management" icon={KeyRound} to="/superadmin/permissions" />
          <QuickActionCard title="View Departments" icon={Building2} to="/superadmin/departments" />
          <QuickActionCard title="Recruitment Overview" icon={Briefcase} to="/superadmin/recruitment" />
          <Button asChild variant="outline" className="h-auto justify-start rounded-2xl border-[#E2E6EF] p-4">
            <Link to="/superadmin/employees">Employee overview</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
