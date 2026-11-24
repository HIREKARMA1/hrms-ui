import { ToastBanner, useToast } from '@/hooks/useToast'

import { HrAttendanceLiveReport } from '../components/HrAttendanceLiveReport'

export function DailyAttendancePage() {
  const { message } = useToast()

  return (
    <div className="mx-auto w-full max-w-[1280px] px-7 pb-8 font-[Inter,system-ui,sans-serif]">
      <ToastBanner message={message} />

      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#17213A]">Daily Attendance</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Employee roster, code or ID lookup, and date range from the live API — check-in, check-out, and
          status by day.
        </p>
      </header>

      <HrAttendanceLiveReport title="Daily employee attendance (live API)" />
    </div>
  )
}

export default DailyAttendancePage