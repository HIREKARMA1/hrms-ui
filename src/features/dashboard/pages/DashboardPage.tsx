import { CalendarRange } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AttendanceOverview } from '../components/AttendanceOverview'
import { DashboardStats } from '../components/DashboardStats'
import { DashboardStatsStatic } from '../components/DashboardStatsStatic'
import { EmployeeDistribution } from '../components/EmployeeDistribution'
import { RecentLeaveRequests } from '../components/RecentLeaveRequests'
import { RecruitmentPipeline } from '../components/RecruitmentPipeline'
import { UpcomingEvents } from '../components/UpcomingEvents'

type DashboardPageProps = {
  /** When true, loads org workforce summary from the API (intended for `/hr/dashboard` only). */
  showWorkforceSummary?: boolean
}

export function DashboardPage({ showWorkforceSummary = false }: DashboardPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your organization&apos;s HR operations.
          </p>
        </div>
        <Button type="button" variant="outline" className="h-10 gap-2 self-start">
          <CalendarRange className="h-4 w-4" />
          Nov 1 – Nov 12, 2026
        </Button>
      </div>

      {showWorkforceSummary ? <DashboardStats /> : <DashboardStatsStatic />}

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceOverview />
        <EmployeeDistribution />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentLeaveRequests />
        </div>
        <UpcomingEvents />
      </div>

      <RecruitmentPipeline />
    </div>
  )
}

export default DashboardPage
