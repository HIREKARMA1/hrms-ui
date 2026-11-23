import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

import { attendanceTrend, departmentAttendance } from '../mocks/attendanceMocks'

export function AttendanceTrendChart() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
        <CardDescription>
          Daily attendance percentage with present and absent employees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceTrend}>
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
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E6EF',
                }}
              />
              <Legend />
              <Bar
                dataKey="present"
                name="Present"
                fill="#5938DB"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#C9BEFF"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DepartmentAttendanceChart() {
  return (
    <Card className="h-full border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Department-wise Attendance</CardTitle>
        <CardDescription>Today&apos;s headcount by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentAttendance} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E6EF" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="department"
                width={110}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E6EF',
                }}
              />
              <Legend />
              <Bar dataKey="present" name="Present" stackId="a" fill="#5938DB" />
              <Bar dataKey="late" name="Late" stackId="a" fill="#F59E0B" />
              <Bar dataKey="onLeave" name="On Leave" stackId="a" fill="#3B82F6" />
              <Bar
                dataKey="absent"
                name="Absent"
                stackId="a"
                fill="#EF4444"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
