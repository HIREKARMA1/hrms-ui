import { ToastBanner, useToast } from '@/hooks/useToast'

import { HrAttendancePolicyReport } from '../components/HrAttendancePolicyReport'

export function AttendanceReportsPage() {
  const { message } = useToast()

  return (
    <div className="mx-auto w-full max-w-[1280px] px-7 pb-8 font-[Inter,system-ui,sans-serif]">
      <ToastBanner message={message} />

      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#17213A]">Attendance Reports</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Processed policy attendance from the live API — employee picker, period summary, and daily
          policy rows.
        </p>
      </header>

      <HrAttendancePolicyReport />
    </div>
  )
}

export default AttendanceReportsPage