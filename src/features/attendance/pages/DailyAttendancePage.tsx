import { HrAttendanceLiveReport } from '../components/HrAttendanceLiveReport'

export function DailyAttendancePage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-7 pb-8 font-[Inter,system-ui,sans-serif]">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#17213A]">Daily Attendance</h1>
      </header>

      <HrAttendanceLiveReport title="Daily employee attendance" />
    </div>
  )
}

export default DailyAttendancePage