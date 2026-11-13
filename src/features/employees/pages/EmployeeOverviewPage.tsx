import { CalendarRange } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Feature } from '@/features/rbac/components/Feature'

import { AttendanceAnalytics } from '../components/AttendanceAnalytics'
import { DepartmentDistribution } from '../components/DepartmentDistribution'
import { EmployeeAttrition } from '../components/EmployeeAttrition'
import { EmployeeStatsCards } from '../components/EmployeeStatsCards'
import { LeaveAnalytics } from '../components/LeaveAnalytics'
import { MonthlyPayrollOverview } from '../components/MonthlyPayrollOverview'
import { NewJoiners } from '../components/NewJoiners'
import { NoticePeriodEmployees } from '../components/NoticePeriodEmployees'
import { UpcomingBirthdays } from '../components/UpcomingBirthdays'
import { WorkAnniversaries } from '../components/WorkAnniversaries'

export function EmployeeOverviewPage() {
  const [dateRange, setDateRange] = useState('this-month')

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Overview of your organization&apos;s workforce and employee analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom" disabled>
                Custom Range
              </SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="h-10 gap-2">
            <CalendarRange className="h-4 w-4" />
            Nov 1 – Nov 12, 2026
          </Button>
        </div>
      </div>

      <Feature name="employee.stats">
        <EmployeeStatsCards />
      </Feature>

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="employee.birthdays">
          <UpcomingBirthdays />
        </Feature>
        <Feature name="employee.anniversaries">
          <WorkAnniversaries />
        </Feature>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="employee.newJoiners">
          <NewJoiners />
        </Feature>
        <Feature name="employee.noticePeriod">
          <NoticePeriodEmployees />
        </Feature>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="employee.departmentDistribution">
          <DepartmentDistribution />
        </Feature>
        <Feature name="employee.attendanceAnalytics">
          <AttendanceAnalytics />
        </Feature>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Feature name="employee.leaveAnalytics">
          <LeaveAnalytics />
        </Feature>
        <Feature name="employee.attrition">
          <EmployeeAttrition />
        </Feature>
      </div>

      <Feature name="employee.payrollOverview">
        <MonthlyPayrollOverview />
      </Feature>
    </div>
  )
}

export default EmployeeOverviewPage
