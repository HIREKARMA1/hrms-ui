/**
 * HR policy attendance report — Attendance Reports page (summary + policy days).
 */
import { useCallback, useState } from 'react'

import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'

import { useAttendancePermissions } from '../hooks'
import { useAttendanceReportRangeState } from '../hooks/useAttendanceReportRangeState'
import type { HrLookupMode } from '../hooks/useHrAttendanceReportActive'
import { useHrAttendanceReportActive } from '../hooks/useHrAttendanceReportActive'
import { hrAttendanceApiLabel } from '../utils/hrAttendanceApiLabel'
import { AttendancePolicyReportResultSection } from './reports/AttendancePolicyReportResultSection'
import { AttendanceReportEmployeePicker } from './reports/AttendanceReportEmployeePicker'
import { AttendancePolicyReportEmployeeStrip } from './reports/policyReport/AttendancePolicyReportEmployeeStrip'
import { AttendancePolicyReportFetchState } from './reports/policyReport/AttendancePolicyReportFetchState'
import { AttendancePolicyReportFilterGrid } from './reports/policyReport/AttendancePolicyReportFilterGrid'
import {
  policyCardClass,
  policyPrimaryText,
  policySecondaryText,
} from './reports/policyReport/attendancePolicyReportUi'

export function HrAttendancePolicyReport() {
  const { canViewEmployeeReports } = useAttendancePermissions()
  const [mode, setMode] = useState<HrLookupMode>('code')
  const [employeeCodeInput, setEmployeeCodeInput] = useState('')
  const [employeeIdInput, setEmployeeIdInput] = useState('')
  const { range, setRange, source, setSource, rangeError, singleDay } =
    useAttendanceReportRangeState()
  const { active, days, activeLookup, lookupReady, submitLookup } = useHrAttendanceReportActive(
    range,
    source,
    rangeError,
    singleDay,
  )

  const onRosterSelect = useCallback((record: EmployeeRecord) => {
    setMode('code')
    setEmployeeCodeInput(record.profile.employeeId)
    setEmployeeIdInput(record.server.id)
  }, [])

  const showResult = lookupReady && !active.isError && !rangeError && Boolean(active.data)

  const endpointLabel = hrAttendanceApiLabel(activeLookup, singleDay)

  if (!canViewEmployeeReports) {
    return (
      <div className={policyCardClass}>
        <div className="border-b border-[#E2E6EF] px-[22px] py-4">
          <h2 className={`text-base font-semibold ${policyPrimaryText}`}>Attendance report (policy)</h2>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E6EF] px-[22px] py-4">
          <h2 className={`text-base font-semibold ${policyPrimaryText}`}>Attendance report (policy)</h2>
          <span className="rounded-lg bg-[#EEF0F6] px-[10px] py-[7px] font-mono text-xs text-[#667085]">
            {endpointLabel}
          </span>
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
          idPrefix="hr-policy"
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
        <AttendancePolicyReportResultSection data={active.data} days={days} />
      ) : null}
    </div>
  )
}