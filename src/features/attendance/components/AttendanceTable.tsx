import { Eye, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import type { DailyAttendanceRecord } from '../types/attendance'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

type AttendanceTableProps = {
  records: DailyAttendanceRecord[]
  selectedIds: string[]
  onToggleAll: (checked: boolean) => void
  onToggleOne: (id: string, checked: boolean) => void
  onView: (record: DailyAttendanceRecord) => void
  onEdit: (record: DailyAttendanceRecord) => void
}

export function AttendanceTable({
  records,
  selectedIds,
  onToggleAll,
  onToggleOne,
  onView,
  onEdit,
}: AttendanceTableProps) {
  const allSelected =
    records.length > 0 && records.every((record) => selectedIds.includes(record.id))

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-muted-bg/70 text-text-secondary">
          <tr>
            <th className="px-4 py-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all"
              />
            </th>
            <th className="px-3 py-3 font-medium">Employee</th>
            <th className="px-3 py-3 font-medium">Employee ID</th>
            <th className="px-3 py-3 font-medium">Department</th>
            <th className="px-3 py-3 font-medium">Designation</th>
            <th className="px-3 py-3 font-medium">Date</th>
            <th className="px-3 py-3 font-medium">Check-in</th>
            <th className="px-3 py-3 font-medium">Check-out</th>
            <th className="px-3 py-3 font-medium">Break</th>
            <th className="px-3 py-3 font-medium">Working Hours</th>
            <th className="px-3 py-3 font-medium">Overtime</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-border-soft">
              <td className="px-4 py-3 align-middle">
                <Checkbox
                  checked={selectedIds.includes(record.id)}
                  onCheckedChange={(checked) =>
                    onToggleOne(record.id, checked === true)
                  }
                  aria-label={`Select ${record.employeeName}`}
                />
              </td>
              <td className="px-3 py-3 align-middle font-medium text-navy">
                {record.employeeName}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.employeeId}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.department}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.designation}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.date}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.checkIn}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.checkOut}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.breakDuration}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.workingHours}
              </td>
              <td className="px-3 py-3 align-middle text-text-secondary">
                {record.overtime}
              </td>
              <td className="px-3 py-3 align-middle">
                <AttendanceStatusBadge status={record.status} />
              </td>
              <td className="px-3 py-3 text-center align-middle">
                <div className="inline-flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-secondary"
                    onClick={() => onView(record)}
                    aria-label={`View ${record.employeeName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-secondary"
                    onClick={() => onEdit(record)}
                    aria-label={`Edit ${record.employeeName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={13}
                className="px-4 py-10 text-center text-text-secondary"
              >
                No attendance records match the selected filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
