import { useState } from 'react'

import type { AttendanceDayRecord, AttendanceReportResult } from '../../types/api/attendanceReport.types'

import { AttendancePolicyDayDetailDialog } from './AttendancePolicyDayDetailDialog'
import { AttendancePolicyDaysTable } from './AttendancePolicyDaysTable'
import { AttendanceReportFallbackBanner } from './AttendanceReportFallbackBanner'
import { AttendanceReportPeriodSummaryCards } from './AttendanceReportPeriodSummaryCards'

type AttendancePolicyReportResultSectionProps = {
  data: AttendanceReportResult
  days: AttendanceDayRecord[]
}

export function AttendancePolicyReportResultSection({
  data,
  days,
}: AttendancePolicyReportResultSectionProps) {
  const [selectedDay, setSelectedDay] = useState<AttendanceDayRecord | null>(null)

  return (
    <div className="space-y-4">
      <AttendanceReportFallbackBanner fallbackReason={data.fallbackReason} source={data.source} />
      <AttendanceReportPeriodSummaryCards
        summary={data.summary}
        fromDate={data.fromDate}
        toDate={data.toDate}
      >
        <AttendancePolicyDaysTable days={days} onDaySelect={setSelectedDay} />
      </AttendanceReportPeriodSummaryCards>
      <AttendancePolicyDayDetailDialog
        open={Boolean(selectedDay)}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null)
        }}
        day={selectedDay}
        policy={data.policy}
        timezone={data.timezone}
      />
    </div>
  )
}