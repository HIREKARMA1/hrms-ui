import type {
  AttendanceReportLunchBreak,
  AttendanceReportTeaBreak,
} from '../../types/api/attendanceReportBreak.types'
import { formatMinutesAsDuration } from '../../utils/attendanceReportDisplay'

type AttendancePolicyDayBreakCardsProps = {
  lunch?: AttendanceReportLunchBreak | null
  tea?: AttendanceReportTeaBreak | null
}

function BreakCard({
  title,
  row,
}: {
  title: string
  row: AttendanceReportLunchBreak | AttendanceReportTeaBreak
}) {
  return (
    <div className="rounded-xl border border-border-soft p-3 text-sm">
      <p className="font-semibold text-navy">{title}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {row.outTime ? (
          <>
            <dt className="text-text-secondary">Out</dt>
            <dd>{row.outTime}</dd>
          </>
        ) : null}
        {row.inTime ? (
          <>
            <dt className="text-text-secondary">In</dt>
            <dd>{row.inTime}</dd>
          </>
        ) : null}
        {row.durationMinutes !== undefined ? (
          <>
            <dt className="text-text-secondary">Duration</dt>
            <dd>{formatMinutesAsDuration(row.durationMinutes)}</dd>
          </>
        ) : null}
        {'lateInMinutes' in row && row.lateInMinutes !== undefined ? (
          <>
            <dt className="text-text-secondary">Late in</dt>
            <dd>{formatMinutesAsDuration(row.lateInMinutes)}</dd>
          </>
        ) : null}
        {row.exceededMinutes !== undefined ? (
          <>
            <dt className="text-text-secondary">Exceeded</dt>
            <dd>{formatMinutesAsDuration(row.exceededMinutes)}</dd>
          </>
        ) : null}
        {row.isExceeded ? (
          <>
            <dt className="text-text-secondary">Status</dt>
            <dd className="text-amber-800">Exceeded</dd>
          </>
        ) : null}
      </dl>
    </div>
  )
}

export function AttendancePolicyDayBreakCards({ lunch, tea }: AttendancePolicyDayBreakCardsProps) {
  if (!lunch && !tea) {
    return <p className="text-sm text-text-secondary">No lunch or tea break recorded.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {lunch ? <BreakCard title="Lunch break" row={lunch} /> : null}
      {tea ? <BreakCard title="Tea break" row={tea} /> : null}
    </div>
  )
}