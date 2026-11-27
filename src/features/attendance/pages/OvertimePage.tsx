import { useCallback, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { AttendanceReportEmployeePicker } from '../components/reports/AttendanceReportEmployeePicker'
import { AttendancePolicyReportFetchState } from '../components/reports/policyReport/AttendancePolicyReportFetchState'
import { AttendancePolicyReportEmployeeStrip } from '../components/reports/policyReport/AttendancePolicyReportEmployeeStrip'
import { AttendancePolicyReportFilterGrid } from '../components/reports/policyReport/AttendancePolicyReportFilterGrid'
import {
  policyCardClass,
  policyPrimaryText,
  policySecondaryText,
} from '../components/reports/policyReport/attendancePolicyReportUi'
import type { HrLookupMode } from '../hooks/useHrAttendanceReportActive'
import { useOvertimeManagementData } from '../hooks/useOvertimeManagementData'
import { formatAttendanceDate, formatMinutesAsDuration } from '../utils/attendanceReportDisplay'

export function OvertimePage() {
  const {
    canViewEmployeeReports,
    range,
    setRange,
    source,
    setSource,
    rangeError,
    active,
    lookupReady,
    submitLookup,
    onRosterSelect,
    rows,
    summary,
    showResult,
    isLoading,
    isFetching,
  } = useOvertimeManagementData()

  const [mode, setMode] = useState<HrLookupMode>('code')
  const [employeeCodeInput, setEmployeeCodeInput] = useState('')
  const [employeeIdInput, setEmployeeIdInput] = useState('')

  const handleRosterSelect = useCallback(
    (record: Parameters<typeof onRosterSelect>[0]) => {
      onRosterSelect(record)
      setMode('code')
      setEmployeeCodeInput(record.profile.employeeId)
      setEmployeeIdInput(record.server.id)
    },
    [onRosterSelect],
  )

  const handleSubmit = useCallback(() => {
    submitLookup(mode, employeeCodeInput, employeeIdInput)
  }, [employeeCodeInput, employeeIdInput, mode, submitLookup])

  const summaryCards = [
    {
      label: 'OT days',
      value: showResult ? summary.dayCount : '—',
      icon: CalendarDays,
      iconClassName: 'bg-emerald-50 text-[#16A34A]',
    },
    {
      label: 'Total overtime',
      value: showResult ? summary.totalOvertime : '—',
      icon: Clock,
      iconClassName: 'bg-indigo-50 text-indigo-600',
    },
  ]

  if (!canViewEmployeeReports) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy">Overtime</h1>
        <p className="text-sm text-text-secondary">
          Your role does not include permission to view employee attendance reports.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Overtime</h1>
        <p className={`mt-1 text-xs ${policySecondaryText}`}>
          Policy-computed overtime from attendance reports (read-only, max 31-day range).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{card.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-navy">
                  {isFetching && !showResult ? '…' : card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={policyCardClass}>
        <div className="border-b border-[#E2E6EF] px-[22px] py-4">
          <h2 className={`text-base font-semibold ${policyPrimaryText}`}>Employee overtime</h2>
          <p className={`mt-1 text-xs ${policySecondaryText}`}>
            Choose an employee and date range, then load the report to see days with overtime.
          </p>
        </div>
        <AttendancePolicyReportFilterGrid
          mode={mode}
          onModeChange={setMode}
          employeeCode={employeeCodeInput}
          onEmployeeCodeChange={setEmployeeCodeInput}
          employeeId={employeeIdInput}
          onEmployeeIdChange={setEmployeeIdInput}
          onSubmit={handleSubmit}
          employeePicker={
            <AttendanceReportEmployeePicker
              selectedCode={employeeCodeInput}
              onSelect={handleRosterSelect}
            />
          }
          idPrefix="ot"
          range={range}
          onRangeChange={setRange}
          source={source}
          onSourceChange={setSource}
          onRefresh={() => void active.refetch()}
          refreshDisabled={!lookupReady || isFetching || Boolean(rangeError)}
          isFetching={isFetching}
        />
        {showResult && active.data ? (
          <AttendancePolicyReportEmployeeStrip data={active.data} dayCount={rows.length} />
        ) : null}
      </div>

      <AttendancePolicyReportFetchState
        rangeError={rangeError}
        placeholder={
          !lookupReady ? 'Choose an employee or enter code / ID, then click Load report.' : null
        }
        isLoading={isLoading}
        isError={lookupReady && active.isError}
        error={active.error}
        loadingMessage="Loading attendance report…"
        errorFallback="Could not load the attendance report."
      />

      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted-bg/70 text-text-secondary">
            <tr>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Net worked</th>
              <th className="px-3 py-3 font-medium">Overtime</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                </td>
              </tr>
            ) : null}
            {rows.map((record) => (
              <tr key={record.id} className="border-t border-border-soft">
                <td className="px-3 py-3 text-text-secondary">
                  {formatAttendanceDate(record.date)}
                </td>
                <td className="px-3 py-3 text-text-secondary">
                  {formatMinutesAsDuration(record.workingMinutes)}
                </td>
                <td className="px-3 py-3 font-medium text-navy">
                  {formatMinutesAsDuration(record.overtimeMinutes)}
                </td>
              </tr>
            ))}
            {!isLoading && !lookupReady && rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-text-secondary">
                  Load a report to see overtime days.
                </td>
              </tr>
            ) : null}
            {!isLoading && lookupReady && showResult && rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-text-secondary">
                  No overtime minutes in this date range for this employee.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OvertimePage