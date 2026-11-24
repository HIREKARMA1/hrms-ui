/**
 * HR employee attendance reports — APIs by employee code or id (range or single day).
 */
import { useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useAttendancePermissions } from '../hooks'
import { useAttendanceReportRangeState } from '../hooks/useAttendanceReportRangeState'
import type { HrLookupMode } from '../hooks/useHrAttendanceReportActive'
import { useHrAttendanceReportActive } from '../hooks/useHrAttendanceReportActive'
import { hrAttendanceApiLabel } from '../utils/hrAttendanceApiLabel'
import { AttendanceReportFetchState } from './reports/AttendanceReportFetchState'
import { AttendanceReportRangeControls } from './reports/AttendanceReportRangeControls'
import { AttendanceReportResultSection } from './reports/AttendanceReportResultSection'
import { HrAttendanceLookupControls } from './reports/HrAttendanceLookupControls'

type HrAttendanceLiveReportProps = {
  defaultMode?: HrLookupMode
  defaultEmployeeCode?: string
  title?: string
}

export function HrAttendanceLiveReport({
  defaultMode = 'code',
  defaultEmployeeCode = '',
  title = 'Employee attendance report (live API)',
}: HrAttendanceLiveReportProps) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const [mode, setMode] = useState<HrLookupMode>(defaultMode)
  const [employeeCodeInput, setEmployeeCodeInput] = useState(defaultEmployeeCode)
  const [employeeIdInput, setEmployeeIdInput] = useState('')
  const { range, setRange, source, setSource, rangeError, singleDay } = useAttendanceReportRangeState()
  const { active, days, activeLookup, lookupReady, submitLookup } = useHrAttendanceReportActive(
    range,
    source,
    rangeError,
    singleDay,
  )

  const showResult = lookupReady && !active.isError && !rangeError && Boolean(active.data)

  if (!canViewEmployeeReports) {
    return (
      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            Your role does not include permission to view employee attendance reports.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {hrAttendanceApiLabel(activeLookup, singleDay)} — processed policy status and in/out times (max 31
          days).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <HrAttendanceLookupControls
          mode={mode}
          onModeChange={setMode}
          employeeCode={employeeCodeInput}
          onEmployeeCodeChange={setEmployeeCodeInput}
          employeeId={employeeIdInput}
          onEmployeeIdChange={setEmployeeIdInput}
          onSubmit={() => submitLookup(mode, employeeCodeInput, employeeIdInput)}
        />
        <AttendanceReportRangeControls
          idPrefix="hr-att"
          range={range}
          onRangeChange={setRange}
          source={source}
          onSourceChange={setSource}
          onRefresh={() => void active.refetch()}
          refreshDisabled={!lookupReady || active.isFetching || Boolean(rangeError)}
          isFetching={active.isFetching}
        />
        <AttendanceReportFetchState
          rangeError={rangeError}
          placeholder={!lookupReady ? 'Enter an employee code or ID, then click Load report.' : null}
          isLoading={lookupReady && active.isFetching && !active.data}
          isError={lookupReady && active.isError}
          error={active.error}
          loadingMessage="Loading attendance report…"
          errorFallback="Could not load the attendance report."
        />
        {showResult && active.data ? (
          <AttendanceReportResultSection data={active.data} days={days} showEmployeeId />
        ) : null}
      </CardContent>
    </Card>
  )
}