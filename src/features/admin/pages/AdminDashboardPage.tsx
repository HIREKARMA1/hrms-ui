/**
 * HR Admin dashboard — workforce stats and live department / attendance APIs.
 */

import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { AttendanceAnalytics } from '@/features/employees/components/AttendanceAnalytics'
import { DepartmentDistribution } from '@/features/employees/components/DepartmentDistribution'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Admin Dashboard</h1>
      </div>

      <DashboardStats />

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceAnalytics />
        <DepartmentDistribution />
      </div>
    </div>
  )
}