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

import { attendanceData } from '../utils/sampleData'

const presentAverage = Math.round(
  attendanceData.reduce((sum, point) => sum + point.present, 0) /
    attendanceData.length,
)

export function AttendanceOverview() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Monthly attendance for the current year</CardDescription>
        </div>
        <div className="rounded-xl bg-brand-50 px-3 py-2 text-right">
          <p className="text-xs font-medium text-brand-600">Present</p>
          <p className="text-lg font-bold text-brand-700">{presentAverage}%</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: 'rgba(109, 92, 246, 0.06)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                }}
              />
              <Bar
                dataKey="present"
                name="Present %"
                fill="#6d5cf6"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="absent"
                name="Absent %"
                fill="#c7d2fe"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
