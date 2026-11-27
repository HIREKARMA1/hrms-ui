import { AppPageHeader } from '@/components/design/AppPageHeader'
import { APP_PAGE_SHELL } from '@/components/design/appUi'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { MyAttendanceLiveReport } from '../components/MyAttendanceLiveReport'

/**
 * Personal attendance view backed by GET /attendance/me (and /me/date/{date} for single days).
 */
export function MyAttendancePage() {
  const { displayName } = useOptionalFeatureAccess()

  return (
    <div className={APP_PAGE_SHELL}>
      <AppPageHeader
        title="My Attendance"
        description={`Personal attendance report for ${displayName ?? 'you'} (from the HRMS attendance API).`}
      />

      <MyAttendanceLiveReport />
    </div>
  )
}

export default MyAttendancePage