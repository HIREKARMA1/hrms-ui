import { ToastBanner, useToast } from '@/hooks/useToast'

import { HrAttendancePolicyReport } from '../components/HrAttendancePolicyReport'

export function AttendanceReportsPage() {
  const { message } = useToast()

  return (
    <div className="mx-auto w-full max-w-[1280px] px-7 pb-8 font-[Inter,system-ui,sans-serif]">
      <ToastBanner message={message} />

      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#17213A]">Attendance Reports</h1>
      </header>

      <HrAttendancePolicyReport />
    </div>
  )
}

export default AttendanceReportsPage