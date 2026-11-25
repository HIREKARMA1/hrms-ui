/**
 * Styled in/out day rows for Daily Attendance (HR live report only).
 */
import { cn } from '@/lib/utils'

import type { AttendanceDayRecord } from '../../../types/api/attendanceReport.types'
import {
  dayRowKey,
  formatAttendanceDate,
  formatAttendanceTime,
  formatMinutesAsDuration,
  mapApiAttendanceStatus,
} from '../../../utils/attendanceReportDisplay'
import {
  policyCardClass,
  policyMutedText,
  policyPrimaryText,
  policySecondaryText,
} from '../policyReport/attendancePolicyReportUi'
import { AttendancePolicyReportStatusBadge } from '../policyReport/AttendancePolicyReportStatusBadge'

type AttendanceLiveDaysTableProps = {
  days: AttendanceDayRecord[]
}

const thClass =
  'whitespace-nowrap bg-[#EEF0F6] px-4 py-[11px] text-left text-[12.5px] font-semibold text-[#667085]'
const tdClass = 'border-t border-[#E2E6EF] px-4 py-[14px] align-middle'

function timeCell(value?: string | null): { text: string; muted: boolean } {
  const text = formatAttendanceTime(value)
  return { text, muted: text === '—' }
}

function durationCell(minutes?: number): { text: string; muted: boolean } {
  const text = formatMinutesAsDuration(minutes)
  const muted = text === '—' || (minutes !== undefined && Math.round(minutes) === 0)
  return { text, muted }
}

export function AttendanceLiveDaysTable({ days }: AttendanceLiveDaysTableProps) {
  if (days.length === 0) {
    return (
      <p className={`px-[22px] pb-[22px] text-sm ${policySecondaryText}`}>
        No attendance rows in this range.
      </p>
    )
  }

  return (
    <div className={cn(policyCardClass, 'overflow-hidden')}>
      <div className="border-b border-[#E2E6EF] px-[22px] py-4">
        <h3 className={`text-base font-semibold ${policyPrimaryText}`}>Daily attendance rows</h3>
      </div>
      <div className="overflow-x-auto px-[22px] pb-[22px]">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={thClass}>Date</th>
              <th className={thClass}>Check-in</th>
              <th className={thClass}>Check-out</th>
              <th className={thClass}>Worked</th>
              <th className={thClass}>Late</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => {
              const checkIn = timeCell(day.checkIn)
              const checkOut = timeCell(day.checkOut)
              const worked = durationCell(day.workingMinutes)
              const late = durationCell(day.lateMinutes)
              return (
                <tr key={dayRowKey(day, index)} className="transition-colors hover:bg-[#F3F4F8]">
                  <td className={cn(tdClass, `font-semibold ${policyPrimaryText}`)}>
                    {formatAttendanceDate(day.date)}
                  </td>
                  <td className={cn(tdClass, checkIn.muted ? policyMutedText : policySecondaryText)}>
                    {checkIn.text}
                  </td>
                  <td className={cn(tdClass, checkOut.muted ? policyMutedText : policySecondaryText)}>
                    {checkOut.text}
                  </td>
                  <td className={cn(tdClass, worked.muted ? policyMutedText : policySecondaryText)}>
                    {worked.text}
                  </td>
                  <td className={cn(tdClass, late.muted ? policyMutedText : policySecondaryText)}>
                    {late.text}
                  </td>
                  <td className={tdClass}>
                    <AttendancePolicyReportStatusBadge status={mapApiAttendanceStatus(day.status)} />
                    {day.displayState ? (
                      <span className={`ml-2 text-xs ${policySecondaryText}`}>({day.displayState})</span>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className={`border-t border-[#E2E6EF] pt-3 text-[12.5px] ${policySecondaryText}`}>
          Showing {days.length} of {days.length} days
        </p>
      </div>
    </div>
  )
}