/**
 * Day-level rows for processed attendance reports (HR and self-service).
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AttendanceStatusBadge } from '../AttendanceStatusBadge'
import type { AttendanceDayRecord } from '../../types/api/attendanceReport.types'
import {
  dayRowKey,
  formatAttendanceDate,
  formatAttendanceTime,
  formatMinutesAsDuration,
  mapApiAttendanceStatus,
} from '../../utils/attendanceReportDisplay'

type AttendanceReportDaysTableProps = {
  days: AttendanceDayRecord[]
}

export function AttendanceReportDaysTable({ days }: AttendanceReportDaysTableProps) {
  if (days.length === 0) {
    return <p className="text-sm text-text-secondary">No attendance rows in this range.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Check-in</TableHead>
          <TableHead>Check-out</TableHead>
          <TableHead>Worked</TableHead>
          <TableHead>Late</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day, index) => (
          <TableRow key={dayRowKey(day, index)}>
            <TableCell>{formatAttendanceDate(day.date)}</TableCell>
            <TableCell className="text-text-secondary">{formatAttendanceTime(day.checkIn)}</TableCell>
            <TableCell className="text-text-secondary">{formatAttendanceTime(day.checkOut)}</TableCell>
            <TableCell className="text-text-secondary">
              {formatMinutesAsDuration(day.workingMinutes)}
            </TableCell>
            <TableCell className="text-text-secondary">
              {formatMinutesAsDuration(day.lateMinutes)}
            </TableCell>
            <TableCell>
              <AttendanceStatusBadge status={mapApiAttendanceStatus(day.status)} />
              {day.displayState ? (
                <span className="ml-2 text-xs text-text-secondary">({day.displayState})</span>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}