import { AbsentTodayEmployees } from '@/features/employees/components/AbsentTodayEmployees'
import { AttendanceAnalytics } from '@/features/employees/components/AttendanceAnalytics'
import { LateArrivalsTodayEmployees } from '@/features/employees/components/LateArrivalsTodayEmployees'
import { OnLeaveTodayEmployees } from '@/features/employees/components/OnLeaveTodayEmployees'
import { PresentTodayEmployees } from '@/features/employees/components/PresentTodayEmployees'
import { Feature } from '@/features/rbac/components/Feature'

import {
  AttendanceOverviewRegularizations,
  AttendanceOverviewTodaySummary,
  AttendanceStats,
} from '../components'

export function AttendanceOverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Attendance Overview</h1>
      </div>

      <Feature name="employee.stats">
        <AttendanceStats />
      </Feature>

      <Feature name="employee.stats">
        <AttendanceOverviewTodaySummary />
      </Feature>

      <Feature name="employee.stats">
        <div className="flex flex-col gap-6">
          <PresentTodayEmployees />
          <AbsentTodayEmployees />
          <Feature name="employee.leaveAnalytics">
            <OnLeaveTodayEmployees />
          </Feature>
          <LateArrivalsTodayEmployees />
        </div>
      </Feature>

      <Feature name="employee.attendanceAnalytics">
        <AttendanceAnalytics />
      </Feature>

      <Feature name="attendance.regularization">
        <AttendanceOverviewRegularizations />
      </Feature>
    </div>
  )
}

export default AttendanceOverviewPage