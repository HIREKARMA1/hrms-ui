import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminDashboardMock } from '@/features/rbac/mocks/rbacMocks'

const CHART_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E2E6EF',
}

const DEPT_COLORS = ['#5938DB', '#17213A', '#8B7CF6', '#C9BEFF', '#3B82F6']

export function AdminDashboardPage() {
  const deptTotal = adminDashboardMock.departments.reduce((s, d) => s + d.value, 0)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Workforce overview and attendance insights for organizational administrators.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {adminDashboardMock.stats.map((stat) => (
          <Card key={stat.id} className="border-border-soft shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Attendance analytics</CardTitle>
            <CardDescription>Weekly present vs absent (mock trend)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminDashboardMock.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis
                    dataKey="label"
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
                  <Legend />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#5938DB"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#C9BEFF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Department distribution</CardTitle>
            <CardDescription>{deptTotal} employees across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div className="mx-auto h-56 w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={adminDashboardMock.departments}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {adminDashboardMock.departments.map((entry, i) => (
                        <Cell key={entry.name} fill={DEPT_COLORS[i % DEPT_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-3 text-sm">
                {adminDashboardMock.departments.map((item, i) => (
                  <li key={item.name} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-text-secondary">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-semibold text-navy">
                      {item.value}
                      <span className="ml-1 text-xs font-medium text-text-secondary">
                        ({Math.round((item.value / deptTotal) * 100)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">Recent activities</CardTitle>
          <CardDescription>Organizational updates from the last few days</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border-soft">
            {adminDashboardMock.activities.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-navy">{item.text}</p>
                <span className="text-xs text-text-secondary">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
