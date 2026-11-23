import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KeyRound, Shield, Users } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { Can } from '@/features/rbac/components/Can'
import { superAdminDashboardMock } from '@/features/rbac/mocks/rbacMocks'
import { ToastBanner, useToast } from '@/hooks/useToast'

const PREVIEW_TOAST = 'UI preview only. Backend authorization required.'

const CHART_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E2E6EF',
}

const DEPT_COLORS = ['#5938DB', '#17213A', '#8B7CF6', '#C9BEFF', '#3B82F6', '#10B981']

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const maxRoleCount = Math.max(
  ...superAdminDashboardMock.roleDistribution.map((r) => r.count),
)

export function SuperAdminDashboardPage() {
  const { message, toast } = useToast()
  const deptTotal = superAdminDashboardMock.departments.reduce((s, d) => s + d.value, 0)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ToastBanner message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Organization-wide metrics, access control, and system activity at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => toast(PREVIEW_TOAST)}
            >
              <Shield className="h-4 w-4" />
              Manage Roles
            </Button>
          </Can>
          <Can>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => toast(PREVIEW_TOAST)}
            >
              <KeyRound className="h-4 w-4" />
              Manage Permissions
            </Button>
          </Can>
          <Can>
            <Button type="button" className="gap-2" onClick={() => toast(PREVIEW_TOAST)}>
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Can>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border-soft shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-navy">Employee growth</CardTitle>
            <CardDescription>Monthly headcount trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={superAdminDashboardMock.employeeGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Line
                    type="monotone"
                    dataKey="employees"
                    name="Employees"
                    stroke="#17213A"
                    strokeWidth={2}
                    dot={{ fill: '#5938DB', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-navy">Department distribution</CardTitle>
            <CardDescription>Headcount by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-center">
              <div className="mx-auto h-52 w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={superAdminDashboardMock.departments}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {superAdminDashboardMock.departments.map((entry, i) => (
                        <Cell key={entry.name} fill={DEPT_COLORS[i % DEPT_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {superAdminDashboardMock.departments.map((item, i) => (
                  <li key={item.name} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-text-secondary">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-semibold text-navy">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-navy">User activity</CardTitle>
            <CardDescription>Daily login volume (mock)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={superAdminDashboardMock.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="logins" name="Logins" fill="#5938DB" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Recent system activities</CardTitle>
            <CardDescription>Auditable events from mock feed</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {superAdminDashboardMock.recentActivities.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 border-b border-border-soft pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-navy">{item.text}</p>
                  <p className="text-xs text-text-secondary">{item.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Recently added employees</CardTitle>
            <CardDescription>Latest onboarding records</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {superAdminDashboardMock.recentEmployees.map((emp) => (
                <li key={emp.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(emp.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{emp.name}</p>
                    <p className="text-xs text-text-secondary">{emp.department}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {emp.id}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Role distribution</CardTitle>
            <CardDescription>Users assigned per role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {superAdminDashboardMock.roleDistribution.map((row) => (
              <div key={row.role}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-navy">{row.role}</span>
                  <span className="text-text-secondary">{row.count} users</span>
                </div>
                <Progress value={Math.round((row.count / maxRoleCount) * 100)} />
              </div>
            ))}
            <p className="text-xs text-text-secondary">
              {deptTotal} employees mapped across {superAdminDashboardMock.departments.length} departments.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
