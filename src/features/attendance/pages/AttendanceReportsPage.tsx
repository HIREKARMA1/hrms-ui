import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, FileBarChart2 } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToastBanner, useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

import { HrAttendanceLiveReport } from '../components/HrAttendanceLiveReport'
import {
  attendanceTrend,
  attendanceStatuses,
  departmentAttendance,
  departments,
} from '../mocks/attendanceMocks'

const REPORT_TYPES = [
  'Monthly',
  'Employee',
  'Department-wise',
  'Late arrival',
  'Early departure',
  'Overtime',
  'Absenteeism',
  'Regularization',
] as const

type ReportType = (typeof REPORT_TYPES)[number]

const SUMMARY_CARDS = [
  { label: 'Avg. attendance rate', value: '94.2%', hint: 'Last 6 months' },
  { label: 'Working days tracked', value: '132', hint: 'Org-wide' },
  { label: 'Late arrivals', value: '48', hint: 'Selected period' },
  { label: 'Overtime hours', value: '126h', hint: 'Approved OT' },
] as const

export function AttendanceReportsPage() {
  const { message, toast } = useToast()
  const [reportType, setReportType] = useState<ReportType>('Monthly')
  const [dateFrom, setDateFrom] = useState('2026-05-01')
  const [dateTo, setDateTo] = useState('2026-11-12')
  const [department, setDepartment] = useState<string>('All')
  const [employeeQuery, setEmployeeQuery] = useState('')
  const [status, setStatus] = useState<string>('All')

  const handleExport = () => {
    toast(
      `Export started for "${reportType}" report (UI preview only). File download is not connected.`,
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ToastBanner message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Attendance Reports</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live employee reports from the attendance API. Charts below remain a UI preview.
          </p>
        </div>
        <Button type="button" className="gap-2 self-start" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <HrAttendanceLiveReport />

      <h2 className="text-lg font-semibold text-navy">Report previews (mock data)</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_TYPES.map((type) => {
          const active = reportType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => setReportType(type)}
              className={cn(
                'rounded-2xl border border-border-soft bg-white p-4 text-left shadow-sm transition-colors hover:border-brand-500/40',
                active && 'border-brand-500 bg-lavender ring-1 ring-brand-500/20',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-navy">{type}</span>
                <FileBarChart2
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-brand-500' : 'text-text-secondary',
                  )}
                />
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Preview metrics and charts for this report type.
              </p>
            </button>
          )
        })}
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">Filters</CardTitle>
          <CardDescription>
            Refine the <Badge className="ml-1 align-middle">{reportType}</Badge> report view.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="report-from">From</Label>
            <Input
              id="report-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-to">To</Label>
            <Input
              id="report-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="report-department">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-employee">Employee</Label>
            <Input
              id="report-employee"
              placeholder="Name or EMP ID"
              value={employeeQuery}
              onChange={(e) => setEmployeeQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="report-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-text-secondary">{card.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-navy">{card.value}</p>
              <p className="mt-2 text-xs text-text-secondary">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy">Attendance trend</CardTitle>
            <CardDescription>Monthly present vs absent (bar chart)</CardDescription>
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
            <CardTitle className="text-navy">Attendance percentage</CardTitle>
            <CardDescription>Monthly rate trend (line chart)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[85, 100]}
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
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    name="Attendance %"
                    stroke="#17213A"
                    strokeWidth={2}
                    dot={{ fill: '#5938DB', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">Department-wise attendance</CardTitle>
          <CardDescription>Stacked breakdown from mock department data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendance} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E6EF" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={120}
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
    </div>
  )
}

export default AttendanceReportsPage
