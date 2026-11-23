import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { AttendanceStatusBadge } from '../components/AttendanceStatusBadge'
import { dailyAttendanceRecords } from '../mocks/attendanceMocks'

/**
 * Personal attendance view reusing attendance status badges/table styling.
 * Scoped to the authenticated employee session — never shows org-wide records.
 */
export function MyAttendancePage() {
  const { employeeId, displayName } = useOptionalFeatureAccess()
  const [selfId] = useState(employeeId ?? 'EMP-1021')

  const records = useMemo(
    () =>
      dailyAttendanceRecords.filter(
        (record) =>
          record.employeeId === selfId ||
          // Demo fallback when session id is not in daily mock set
          (selfId.startsWith('USR-') && record.employeeId === 'EMP-1021') ||
          (selfId === 'EMP-1001' && record.employeeId === 'EMP-1021'),
      ),
    [selfId],
  )

  const scoped = records.length > 0 ? records : dailyAttendanceRecords.slice(0, 1)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          My Attendance
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Personal attendance records for {displayName ?? 'you'} only.
        </p>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Recent attendance</CardTitle>
          <CardDescription>
            Scoped to employee ID{' '}
            <Badge variant="secondary">{scoped[0]?.employeeId ?? selfId}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoped.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="text-text-secondary">
                    {record.checkIn}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {record.checkOut}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {record.breakDuration}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {record.workingHours}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {record.overtime}
                  </TableCell>
                  <TableCell>
                    <AttendanceStatusBadge status={record.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default MyAttendancePage
