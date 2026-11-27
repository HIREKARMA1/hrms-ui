/**
 * Employee self-service live report — GET /attendance/me (and single-day variant).
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useMyAttendanceReportActive } from '../hooks/useMyAttendanceReportActive'
import { useAttendanceReportRangeState } from '../hooks/useAttendanceReportRangeState'
import { AttendancePolicyReportResultSection } from './reports/AttendancePolicyReportResultSection'
import { AttendancePolicyReportEmployeeStrip } from './reports/policyReport/AttendancePolicyReportEmployeeStrip'
import { AttendanceReportFetchState } from './reports/AttendanceReportFetchState'
import { AttendanceReportRangeControls } from './reports/AttendanceReportRangeControls'

export function MyAttendanceLiveReport() {
  const { range, setRange, source, setSource, rangeError, singleDay } = useAttendanceReportRangeState()
  const { active, days } = useMyAttendanceReportActive(range, source, rangeError, singleDay)

  const showResult = !active.isError && !rangeError && Boolean(active.data)

  return (
    <div className="space-y-6">
      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Live attendance report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AttendanceReportRangeControls
            idPrefix="my-att"
            range={range}
            onRangeChange={setRange}
            source={source}
            onSourceChange={setSource}
            onRefresh={() => void active.refetch()}
            refreshDisabled={active.isFetching || Boolean(rangeError)}
            isFetching={active.isFetching}
          />
          <AttendanceReportFetchState
            rangeError={rangeError}
            isLoading={active.isFetching && !active.data}
            isError={active.isError}
            error={active.error}
            loadingMessage="Loading your attendance…"
            errorFallback="Could not load your attendance report."
          />
          {showResult && active.data ? (
            <AttendancePolicyReportEmployeeStrip data={active.data} dayCount={days.length} />
          ) : null}
        </CardContent>
      </Card>

      {showResult && active.data ? (
        <AttendancePolicyReportResultSection data={active.data} days={days} />
      ) : null}
    </div>
  )
}