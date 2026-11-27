import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipboardList } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hrDashboardMock } from '@/features/rbac/mocks/rbacMocks'

const CHART_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E2E6EF',
}

export function HrDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">HR Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Day-to-day HR operations, pending tasks, and workforce analytics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hrDashboardMock.stats.map((stat) => (
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
            <CardTitle className="flex items-center gap-2 text-navy">
              <ClipboardList className="h-5 w-5 text-brand-500" />
              Pending HR activities
            </CardTitle>
            <CardDescription>Items requiring HR follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {hrDashboardMock.pendingActivities.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border-soft bg-muted-bg/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-navy">{item.title}</p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{item.meta}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Employee analytics</CardTitle>
            <CardDescription>Headcount by department (mock)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrDashboardMock.analytics} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E6EF" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar
                    dataKey="headcount"
                    name="Headcount"
                    fill="#0F766E"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
