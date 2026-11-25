import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { AttendanceReportDayPunch } from '../../types/api/attendanceReport.types'
import { formatAttendanceTime } from '../../utils/attendanceReportDisplay'

type AttendancePolicyDayPunchesTableProps = {
  punches?: AttendanceReportDayPunch[]
}

export function AttendancePolicyDayPunchesTable({ punches }: AttendancePolicyDayPunchesTableProps) {
  if (!punches?.length) {
    return <p className="text-sm text-text-secondary">No punches for this day.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Verify</TableHead>
          <TableHead>Row</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {punches.map((punch, index) => (
          <TableRow key={`${punch.punchTime}-${index}`}>
            <TableCell>{formatAttendanceTime(punch.punchTime)}</TableCell>
            <TableCell>{punch.punchType ?? '—'}</TableCell>
            <TableCell className="text-text-secondary">{punch.verifyMode ?? '—'}</TableCell>
            <TableCell className="font-mono text-xs text-text-secondary">
              {punch.sourceRowId ?? '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}