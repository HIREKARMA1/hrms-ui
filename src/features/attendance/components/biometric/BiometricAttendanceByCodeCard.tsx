/**
 * Raw TimeWatch punches by HRMS employee code (biometric API, not processed /attendance reports).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useBiometricAttendanceByCodeCard } from '../../hooks/useBiometricAttendanceByCodeCard'
import type { AttendanceReportSource } from '../../constants/attendanceApiAccess'
import { AttendanceReportFetchState } from '../reports/AttendanceReportFetchState'
import { AttendanceReportRangeControls } from '../reports/AttendanceReportRangeControls'
import { BiometricCodeLookupField } from './BiometricCodeLookupField'
import { BiometricPunchResultSection } from './BiometricPunchResultSection'

export function BiometricAttendanceByCodeCard() {
  const state = useBiometricAttendanceByCodeCard()
  const { attendance, trimmedCode, rangeError, punches } = state

  const showResult =
    Boolean(trimmedCode) && !attendance.isError && !rangeError && Boolean(attendance.data)

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-navy">Punch lookup by employee code</CardTitle>
        <CardDescription>
          Look up TimeWatch punches using the HRMS employee code (for example HK0008).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BiometricCodeLookupField
          value={state.codeDraft}
          onChange={state.setCodeDraft}
          onSubmit={state.runLookup}
        />

        <AttendanceReportRangeControls
          idPrefix="bio-code"
          range={state.range}
          onRangeChange={state.setRange}
          source={state.source}
          onSourceChange={(value) => state.setSource(value as AttendanceReportSource)}
          onRefresh={() => void attendance.refetch()}
          refreshDisabled={!trimmedCode || attendance.isFetching || Boolean(rangeError)}
          isFetching={attendance.isFetching}
        />

        <AttendanceReportFetchState
          rangeError={rangeError}
          placeholder={!trimmedCode ? 'Enter an employee code and click Load punches.' : null}
          isLoading={Boolean(trimmedCode) && attendance.isFetching && !attendance.data}
          isError={Boolean(trimmedCode) && attendance.isError}
          error={attendance.error}
          loadingMessage={`Loading punches for ${trimmedCode}…`}
          errorFallback="Could not load biometric attendance."
        />

        {showResult && attendance.data ? (
          <BiometricPunchResultSection
            employeeCode={trimmedCode}
            source={attendance.data.source}
            punches={punches}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}