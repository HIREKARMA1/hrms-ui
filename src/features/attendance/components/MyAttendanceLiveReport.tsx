/**
 * Employee self-service live report — GET /attendance/me (and single-day variant).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useMyAttendanceReportActive } from '../hooks/useMyAttendanceReportActive'
import { useAttendanceReportRangeState } from '../hooks/useAttendanceReportRangeState'
import { AttendanceReportFetchState } from './reports/AttendanceReportFetchState'
import { AttendanceReportRangeControls } from './reports/AttendanceReportRangeControls'
import { AttendanceReportResultSection } from './reports/AttendanceReportResultSection'

export function MyAttendanceLiveReport() {
  const { range, setRange, source, setSource, rangeError, singleDay } = useAttendanceReportRangeState()
  const { active, days } = useMyAttendanceReportActive(range, source, rangeError, singleDay)

  const showResult = !active.isError && !rangeError && Boolean(active.data)

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>Live attendance report</CardTitle>
        <CardDescription>
          From GET /attendance/me — policy status, in/out times, and minutes (max 31 days).
        </CardDescription>
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
          <AttendanceReportResultSection data={active.data} days={days} />
        ) : null}
      </CardContent>
    </Card>
  )
}