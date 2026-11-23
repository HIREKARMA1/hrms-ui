import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { MyAttendanceLiveReport } from '../components/MyAttendanceLiveReport'

/**
 * Personal attendance view backed by GET /attendance/me (and /me/date/{date} for single days).
 */
export function MyAttendancePage() {
  const { displayName } = useOptionalFeatureAccess()

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">My Attendance</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Personal attendance report for {displayName ?? 'you'} (from the HRMS attendance API).
        </p>
      </div>

      <MyAttendanceLiveReport />
    </div>
  )
}

export default MyAttendancePage