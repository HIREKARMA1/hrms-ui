import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { payrollSummary } from '../mocks/employeeDashboard.mock'
import { formatInr } from '../utils/format'

export function MonthlyPayrollOverview() {
  const [period, setPeriod] = useState('6m')
  const chartData =
    period === '3m' ? payrollSummary.trend.slice(-3) : payrollSummary.trend

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Monthly Payroll Overview</CardTitle>
          <CardDescription>
            Sample payroll totals and month-wise comparison
          </CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <PayrollMetric label="Total Payroll" value={formatInr(payrollSummary.totalPayroll)} />
          <PayrollMetric label="Gross Salary" value={formatInr(payrollSummary.grossSalary)} />
          <PayrollMetric label="Net Salary" value={formatInr(payrollSummary.netSalary)} />
          <PayrollMetric
            label="Total Deductions"
            value={formatInr(payrollSummary.totalDeductions)}
          />
          <PayrollMetric
            label="Employees Included"
            value={String(payrollSummary.employeesIncluded)}
          />
        </div>

        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
                tickFormatter={(value: number) =>
                  `₹${Math.round(value / 100000) / 10}L`
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatInr(Number(value)),
                  'Payroll',
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E6EF',
                }}
              />
              <Bar
                dataKey="amount"
                fill="#5938DB"
                radius={[8, 8, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function PayrollMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-3 py-3">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-base font-bold text-navy">{value}</p>
    </div>
  )
}
