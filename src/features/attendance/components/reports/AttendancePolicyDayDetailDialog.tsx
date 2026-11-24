import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AttendanceDayRecord, AttendanceReportResult } from '../../types/api/attendanceReport.types'
import { formatAttendanceDate } from '../../utils/attendanceReportDisplay'
import { AttendancePolicyDayDetailBody } from './AttendancePolicyDayDetailBody'

type AttendancePolicyDayDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  day: AttendanceDayRecord | null
  policy?: AttendanceReportResult['policy']
  timezone?: string
}

export function AttendancePolicyDayDetailDialog({
  open,
  onOpenChange,
  day,
  policy,
  timezone,
}: AttendancePolicyDayDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-5 p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {day ? formatAttendanceDate(day.date) : 'Day detail'}
            {day?.weekday ? ` · ${day.weekday}` : ''}
          </DialogTitle>
          <DialogDescription>
            Policy attendance detail{timezone ? ` · ${timezone}` : ''}.
          </DialogDescription>
        </DialogHeader>
        {day ? <AttendancePolicyDayDetailBody day={day} policy={policy} /> : null}
      </DialogContent>
    </Dialog>
  )
}