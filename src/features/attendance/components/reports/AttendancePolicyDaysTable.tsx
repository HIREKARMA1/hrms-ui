/**
 * Policy-oriented day rows for Attendance Reports (not Daily punch view).
 */
import { Eye } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { AttendanceDayRecord } from '../../types/api/attendanceReport.types'
import {
  dayRowKey,
  formatAttendanceDate,
  formatAttendanceTime,
  formatMinutesAsDuration,
  mapApiAttendanceStatus,
} from '../../utils/attendanceReportDisplay'
import { policyMutedText, policyPrimaryText, policySecondaryText } from './policyReport/attendancePolicyReportUi'
import { AttendancePolicyReportStatusBadge } from './policyReport/AttendancePolicyReportStatusBadge'

type AttendancePolicyDaysTableProps = {
  days: AttendanceDayRecord[]
  onDaySelect?: (day: AttendanceDayRecord) => void
}

const thClass =
  'whitespace-nowrap bg-[#EEF0F6] px-4 py-[11px] text-left text-[12.5px] font-semibold text-[#667085]'
const tdClass = 'border-t border-[#E2E6EF] px-4 py-[14px] align-middle'

function isMutedDuration(minutes?: number): boolean {
  if (minutes === undefined || !Number.isFinite(minutes)) return false
  return Math.round(minutes) === 0
}

function durationCell(minutes?: number): { text: string; muted: boolean } {
  const text = formatMinutesAsDuration(minutes)
  const muted = text === '—' || isMutedDuration(minutes)
  return { text, muted }
}

function issueCodes(day: AttendanceDayRecord): string[] {
  if (day.issues?.length) return day.issues
  if (day.flags?.length) return day.flags
  return []
}

function IssueTags({ codes }: { codes: string[] }) {
  if (codes.length === 0) return <span className={policyMutedText}>—</span>
  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {codes.map((code) => {
        const isMissedOut = code.toUpperCase().includes('MISSED_OUT_PUNCH')
        return (
          <span
            key={code}
            className={cn(
              'rounded-md px-[7px] py-[5px] font-mono text-[11px] font-medium',
              isMissedOut ? 'bg-[#FDEAEA] text-[#EF4444]' : 'bg-[#FEF3DC] text-[#B45309]',
            )}
          >
            {code}
          </span>
        )
      })}
    </div>
  )
}

function PunchChips({ day }: { day: AttendanceDayRecord }) {
  const punches = day.punches ?? []
  if (punches.length === 0) return <span className={policyMutedText}>—</span>
  return (
    <div className="flex max-w-[300px] flex-wrap gap-1.5">
      {punches.map((p, i) => {
        const type = (p.punchType ?? 'PUNCH').toUpperCase()
        const isIn = type === 'IN'
        const isOut = type === 'OUT'
        const labelClass = isIn
          ? 'text-[#16A34A]'
          : isOut
            ? 'text-[#7055EB]'
            : 'text-[#17213A]'
        return (
          <span
            key={`${p.punchTime}-${i}`}
            className="rounded-md bg-[#EEF0F6] px-2 py-1 text-xs text-[#17213A]"
          >
            <span className={cn('text-[11px] font-bold', labelClass)}>{type}</span>{' '}
            {formatAttendanceTime(p.punchTime)}
          </span>
        )
      })}
    </div>
  )
}

export function AttendancePolicyDaysTable({ days, onDaySelect }: AttendancePolicyDaysTableProps) {
  if (days.length === 0) {
    return (
      <p className={`px-[22px] pb-[22px] text-sm ${policySecondaryText}`}>
        No attendance rows in this range.
      </p>
    )
  }

  return (
    <div className="border-t border-[#E2E6EF]">
      <div className="px-[22px] py-4">
        <h3 className={`text-base font-semibold ${policyPrimaryText}`}>Daily policy rows</h3>
      </div>
      <div className="overflow-x-auto px-[22px] pb-[22px]">
        <table className="min-w-[1020px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={thClass}>Date</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>State</th>
              <th className={thClass}>Worked</th>
              <th className={thClass}>Late</th>
              <th className={thClass}>OT</th>
              <th className={thClass}>Context</th>
              <th className={thClass}>Issues</th>
              <th className={thClass}>Punches</th>
              <th className={cn(thClass, 'text-right')}>Action</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => {
              const worked = durationCell(day.workingMinutes)
              const late = durationCell(day.lateMinutes ?? day.lateAfterGraceMinutes)
              const ot = durationCell(day.overtimeMinutes)
              const stateText = day.displayState?.trim() ? day.displayState : '—'
              const contextText = day.dayContext?.trim() ? day.dayContext : '—'

              return (
                <tr key={dayRowKey(day, index)} className="transition-colors hover:bg-[#F3F4F8]">
                  <td className={tdClass}>
                    <div className={`font-semibold ${policyPrimaryText}`}>
                      {formatAttendanceDate(day.date)}
                    </div>
                    {day.weekday ? (
                      <div className={`text-[12.5px] ${policySecondaryText}`}>{day.weekday}</div>
                    ) : null}
                  </td>
                  <td className={tdClass}>
                    <AttendancePolicyReportStatusBadge status={mapApiAttendanceStatus(day.status)} />
                    {day.isRegularised ? (
                      <span className={`ml-2 text-xs ${policySecondaryText}`}>(regularised)</span>
                    ) : null}
                  </td>
                  <td className={cn(tdClass, stateText === '—' ? policyMutedText : policySecondaryText)}>
                    {stateText}
                  </td>
                  <td className={cn(tdClass, worked.muted ? policyMutedText : policySecondaryText)}>
                    {worked.text}
                  </td>
                  <td className={cn(tdClass, late.muted ? policyMutedText : policySecondaryText)}>
                    {late.text}
                  </td>
                  <td className={cn(tdClass, ot.muted ? policyMutedText : policySecondaryText)}>
                    {ot.text}
                  </td>
                  <td className={cn(tdClass, contextText === '—' ? policyMutedText : policySecondaryText)}>
                    {contextText}
                  </td>
                  <td className={tdClass}>
                    <IssueTags codes={issueCodes(day)} />
                  </td>
                  <td className={tdClass}>
                    <PunchChips day={day} />
                  </td>
                  <td className={cn(tdClass, 'text-right')}>
                    <button
                      type="button"
                      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-[#E2E6EF] bg-white text-[#7055EB] transition-colors hover:bg-[#CCFBF1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8B5CF6]"
                      aria-label={`View attendance for ${day.date}`}
                      onClick={() => onDaySelect?.(day)}
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className={`mt-0 border-t border-[#E2E6EF] pt-3 text-[12.5px] ${policySecondaryText}`}>
          Showing {days.length} of {days.length} days
        </p>
      </div>
    </div>
  )
}