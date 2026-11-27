import { AppPageHeader } from '@/components/design/AppPageHeader'
import { APP_PAGE_SHELL } from '@/components/design/appUi'
// import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { MyAttendanceLiveReport } from '../components/MyAttendanceLiveReport'

/**
 * Personal attendance view backed by GET /attendance/me (and /me/date/{date} for single days).
 */
export function MyAttendancePage() {
  return (
    <div className={APP_PAGE_SHELL}>
      <AppPageHeader
        title="My Attendance"
        description={`Personal attendance report for you (from the HRMS attendance API).`}
      />
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">My Attendance</h1>
      </div>

      <MyAttendanceLiveReport />
    </div>
    </div>
  )
}

export default MyAttendancePage