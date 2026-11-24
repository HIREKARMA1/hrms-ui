/**
 * Employee table for Attendance Reports roster (copy code/id, use in live report).
 */
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'

type AttendanceReportsRosterTableProps = {
  rows: EmployeeRecord[]
  onCopyField: (label: string, value: string) => void
  onUseInReport: (record: EmployeeRecord) => void
}

export function AttendanceReportsRosterTable({
  rows,
  onCopyField,
  onUseInReport,
}: AttendanceReportsRosterTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-text-secondary">
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.server.id}>
                <TableCell className="font-medium text-navy">
                  {row.profile.firstName} {row.profile.lastName}
                </TableCell>
                <TableCell className="font-mono text-xs">{row.profile.employeeId}</TableCell>
                <TableCell className="max-w-[11rem] truncate font-mono text-xs" title={row.server.id}>
                  {row.server.id}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => onCopyField('Code', row.profile.employeeId)}
                    >
                      <Copy className="h-3 w-3" />
                      Code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => onCopyField('Employee ID', row.server.id)}
                    >
                      <Copy className="h-3 w-3" />
                      ID
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onUseInReport(row)}
                    >
                      Use in report
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}