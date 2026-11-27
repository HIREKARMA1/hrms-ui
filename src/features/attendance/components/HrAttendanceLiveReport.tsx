/**
 * HR employee attendance reports — APIs by employee code or id (range or single day).
 */
import { useCallback, useEffect, useState } from 'react'

import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'

import { DEFAULT_ATTENDANCE_REPORT_SOURCE } from '../constants/attendanceReportSourceOptions'
import { useAttendancePermissions } from '../hooks'
import { useAttendanceReportRangeState } from '../hooks/useAttendanceReportRangeState'
import type { HrLookupMode } from '../hooks/useHrAttendanceReportActive'
import { useHrAttendanceReportActive } from '../hooks/useHrAttendanceReportActive'
import { AttendanceReportEmployeePicker } from './reports/AttendanceReportEmployeePicker'
import { AttendanceLiveReportResultSection } from './reports/liveDaily/AttendanceLiveReportResultSection'
import { AttendancePolicyReportEmployeeStrip } from './reports/policyReport/AttendancePolicyReportEmployeeStrip'
import { AttendancePolicyReportFetchState } from './reports/policyReport/AttendancePolicyReportFetchState'
import { AttendancePolicyReportFilterGrid } from './reports/policyReport/AttendancePolicyReportFilterGrid'
import {
  policyCardClass,
  policyPrimaryText,
  policySecondaryText,
} from './reports/policyReport/attendancePolicyReportUi'
import type { HrAttendanceReportPreset } from '../types/hrAttendanceReportPreset'

export type { HrAttendanceReportPreset } from '../types/hrAttendanceReportPreset'

type HrAttendanceLiveReportProps = {
  defaultMode?: HrLookupMode
  defaultEmployeeCode?: string
  title?: string
  /** Bump `presetVersion` when applying roster “Use in report”. */
  preset?: HrAttendanceReportPreset | null
  presetVersion?: number
}

export function HrAttendanceLiveReport({
  defaultMode = 'code',
  defaultEmployeeCode = '',
  title = 'Employee attendance report (live API)',
  preset,
  presetVersion = 0,
}: HrAttendanceLiveReportProps) {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const [mode, setMode] = useState<HrLookupMode>(defaultMode)
  const [employeeCodeInput, setEmployeeCodeInput] = useState(defaultEmployeeCode)
  const [employeeIdInput, setEmployeeIdInput] = useState('')
  const { range, setRange, source, setSource, rangeError, singleDay } =
    useAttendanceReportRangeState()
  const { active, days, lookupReady, submitLookup } = useHrAttendanceReportActive(
    range,
    source,
    rangeError,
    singleDay,
  )

  useEffect(() => {
    if (!preset || presetVersion < 1) return
    setMode(preset.mode)
    setEmployeeCodeInput(preset.employeeCode)
    setEmployeeIdInput(preset.employeeId)
    setSource(DEFAULT_ATTENDANCE_REPORT_SOURCE)
    if (preset.autoLoad) {
      submitLookup(preset.mode, preset.employeeCode, preset.employeeId)
    }
    // Only re-apply when the roster bumps `presetVersion` (not when `submitLookup` identity changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetVersion])

  const onRosterSelect = useCallback((record: EmployeeRecord) => {
    setMode('code')
    setEmployeeCodeInput(record.profile.employeeId)
    setEmployeeIdInput(record.server.id)
  }, [])

  const showResult = lookupReady && !active.isError && !rangeError && Boolean(active.data)

  if (!canViewEmployeeReports) {
    return (
      <div className={policyCardClass}>
        <div className="border-b border-[#E2E6EF] px-[22px] py-4">
          <h2 className={`text-base font-semibold ${policyPrimaryText}`}>{title}</h2>
        </div>
        <div className="px-[22px] py-4">
          <p className={`text-sm ${policySecondaryText}`}>
            Your role does not include permission to view employee attendance reports.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={policyCardClass}>
        <div className="border-b border-[#E2E6EF] px-[22px] py-4">
          <h2 className={`text-base font-semibold ${policyPrimaryText}`}>{title}</h2>
          <p className={`mt-1 text-xs ${policySecondaryText}`}>
            Processed policy status and in/out times (max 31 days).
          </p>
        </div>
        <AttendancePolicyReportFilterGrid
          mode={mode}
          onModeChange={setMode}
          employeeCode={employeeCodeInput}
          onEmployeeCodeChange={setEmployeeCodeInput}
          employeeId={employeeIdInput}
          onEmployeeIdChange={setEmployeeIdInput}
          onSubmit={() => submitLookup(mode, employeeCodeInput, employeeIdInput)}
          employeePicker={
            <AttendanceReportEmployeePicker
              selectedCode={employeeCodeInput}
              onSelect={onRosterSelect}
            />
          }
          idPrefix="hr-att"
          range={range}
          onRangeChange={setRange}
          source={source}
          onSourceChange={setSource}
          onRefresh={() => void active.refetch()}
          refreshDisabled={!lookupReady || active.isFetching || Boolean(rangeError)}
          isFetching={active.isFetching}
        />
        {showResult && active.data ? (
          <AttendancePolicyReportEmployeeStrip data={active.data} dayCount={days.length} />
        ) : null}
      </div>

      <AttendancePolicyReportFetchState
        rangeError={rangeError}
        placeholder={
          !lookupReady
            ? 'Choose an employee or enter code / ID, then click Load report.'
            : null
        }
        isLoading={lookupReady && active.isFetching && !active.data}
        isError={lookupReady && active.isError}
        error={active.error}
        loadingMessage="Loading attendance report…"
        errorFallback="Could not load the attendance report."
      />

      {showResult && active.data ? (
        <AttendanceLiveReportResultSection data={active.data} days={days} />
      ) : null}
    </div>
  )
}