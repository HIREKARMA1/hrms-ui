import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { AttendanceStatusBadge } from '../AttendanceStatusBadge'
import type { AttendanceDayRecord, AttendanceReportResult } from '../../types/api/attendanceReport.types'
import {
  formatAttendanceTime,
  formatMinutesAsDuration,
  mapApiAttendanceStatus,
} from '../../utils/attendanceReportDisplay'
import { AttendancePolicyDayBreakCards } from './AttendancePolicyDayBreakCards'
import { AttendancePolicyDayPunchesTable } from './AttendancePolicyDayPunchesTable'
import { AttendancePolicySnippet } from './AttendancePolicySnippet'

type AttendancePolicyDayDetailBodyProps = {
  day: AttendanceDayRecord
  policy?: AttendanceReportResult['policy']
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-sm font-medium text-navy">{value}</p>
    </div>
  )
}

export function AttendancePolicyDayDetailBody({ day, policy }: AttendancePolicyDayDetailBodyProps) {
  const flags = [...(day.flags ?? []), ...(day.issues ?? [])]

  return (
    <ScrollArea className="max-h-[min(70vh,560px)] pr-3">
      <div className="space-y-5 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <AttendanceStatusBadge status={mapApiAttendanceStatus(day.status)} />
          {day.rawStatus && day.rawStatus !== day.status ? (
            <span className="text-xs text-text-secondary">Raw: {day.rawStatus}</span>
          ) : null}
          <span className="text-xs text-text-secondary">State: {day.displayState ?? '—'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <DetailMetric label="First in" value={formatAttendanceTime(day.checkIn)} />
          <DetailMetric label="Last out" value={formatAttendanceTime(day.checkOut)} />
          <DetailMetric label="Net worked" value={formatMinutesAsDuration(day.workingMinutes)} />
          <DetailMetric label="Gross" value={formatMinutesAsDuration(day.grossMinutes)} />
          <DetailMetric label="Late" value={formatMinutesAsDuration(day.lateMinutes)} />
          <DetailMetric label="OT" value={formatMinutesAsDuration(day.overtimeMinutes)} />
        </div>

        {flags.length ? (
          <div>
            <h4 className="text-sm font-semibold text-navy">Flags & issues</h4>
            <p className="mt-1 text-sm text-text-secondary">{flags.join(', ')}</p>
          </div>
        ) : null}

        {day.dayContext ? <DetailMetric label="Context" value={day.dayContext} /> : null}

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-navy">Breaks</h4>
          <AttendancePolicyDayBreakCards lunch={day.lunchBreak} tea={day.teaBreak} />
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-navy">Punches</h4>
          <AttendancePolicyDayPunchesTable punches={day.punches} />
        </div>

        <Separator />

        <AttendancePolicySnippet policy={policy} />
      </div>
    </ScrollArea>
  )
}