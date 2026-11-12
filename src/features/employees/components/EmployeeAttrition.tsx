import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { attritionSummary } from '../mocks/employeeDashboard.mock'

export function EmployeeAttrition() {
  const {
    currentRate,
    exitedThisMonth,
    exitedThisYear,
    previousMonthRate,
    trend,
  } = attritionSummary

  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Employee Attrition Rate</CardTitle>
        <CardDescription>Monthly attrition trend and exits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Current Rate" value={`${currentRate}%`} emphasis />
          <Metric label="Exited This Month" value={String(exitedThisMonth)} />
          <Metric label="Exited This Year" value={String(exitedThisYear)} />
          <Metric
            label="Previous Month"
            value={`${previousMonthRate}%`}
          />
        </div>

        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
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
                unit="%"
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Attrition']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E6EF',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#5938DB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#5938DB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-2">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p
        className={
          emphasis
            ? 'mt-1 text-xl font-bold text-brand-500'
            : 'mt-1 text-lg font-bold text-navy'
        }
      >
        {value}
      </p>
    </div>
  )
}
