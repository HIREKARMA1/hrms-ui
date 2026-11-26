/**
 * Create regularization — POST /attendance/employees/{employeeId}/regularizations.
 */
import { useCallback, useMemo, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useAttendanceRegularizationTypeOptions } from '../../hooks/useAttendanceRegularizationTypeOptions'
import { AttendanceReportEmployeePicker } from '../reports/AttendanceReportEmployeePicker'

export type AttendanceRegularizationFormValues = {
  employeeId: string
  attendanceDate: string
  type: string
  reason: string
}

type AttendanceRegularizationFormProps = {
  showEmployeeIdField: boolean
  defaultEmployeeId?: string
  disabled?: boolean
  isEmployeeWorkspace: boolean
  linkedEmployeeId: string
  onSubmit: (values: AttendanceRegularizationFormValues) => void | Promise<void>
}

const emptyValues = (employeeId = ''): AttendanceRegularizationFormValues => ({
  employeeId,
  attendanceDate: '',
  type: '',
  reason: '',
})

export function AttendanceRegularizationForm({
  showEmployeeIdField,
  defaultEmployeeId = '',
  disabled = false,
  isEmployeeWorkspace,
  linkedEmployeeId,
  onSubmit,
}: AttendanceRegularizationFormProps) {
  const [values, setValues] = useState(() => emptyValues(defaultEmployeeId))
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [employeeCode, setEmployeeCode] = useState('')
  const [employeeDisplayName, setEmployeeDisplayName] = useState('')

  const onRosterSelect = useCallback((record: EmployeeRecord) => {
    const name = `${record.profile.firstName} ${record.profile.lastName}`.trim()
    setEmployeeCode(record.profile.employeeId)
    setEmployeeDisplayName(name)
    setValues((prev) => ({
      ...prev,
      employeeId: record.server.id,
      type: '',
    }))
  }, [])

  const resolvedEmployeeId = useMemo(
    () => (showEmployeeIdField ? values.employeeId.trim() : linkedEmployeeId.trim()),
    [linkedEmployeeId, showEmployeeIdField, values.employeeId],
  )

  const { options, isFetchingReport, canFetchReport, reportLoaded } =
    useAttendanceRegularizationTypeOptions({
      employeeId: resolvedEmployeeId,
      attendanceDate: values.attendanceDate,
      isEmployeeWorkspace,
    })

  const hasReportIssues = reportLoaded && options.length > 0
  const typeSelectDisabled = disabled || !canFetchReport || isFetchingReport || !reportLoaded
  const submitDisabled = disabled || (reportLoaded && options.length === 0)

  const typePlaceholder = useMemo(() => {
    if (!canFetchReport) {
      return showEmployeeIdField ? 'Select employee and date first' : 'Select attendance date first'
    }
    if (isFetchingReport) return 'Loading attendance report…'
    if (reportLoaded && options.length === 0) return 'No issues on this date'
    return 'Select issue to regularize'
  }, [canFetchReport, isFetchingReport, options.length, reportLoaded, showEmployeeIdField])

  const optionValues = useMemo(() => new Set(options.map((o) => o.value)), [options])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!values.attendanceDate) {
      setFieldError('Attendance date is required.')
      return
    }

    if (!values.type) {
      setFieldError('Select an issue from the attendance report.')
      return
    }

    if (!optionValues.has(values.type)) {
      setFieldError('Selected type is not on the report for this date. Refresh and try again.')
      return
    }

    if (!values.reason.trim()) {
      setFieldError('Reason is required.')
      return
    }

    if (showEmployeeIdField && !values.employeeId.trim()) {
      setFieldError('Select an employee from the roster.')
      return
    }

    setFieldError(null)
    await onSubmit(values)
    setEmployeeCode('')
    setEmployeeDisplayName('')
    setValues(emptyValues(defaultEmployeeId))
  }

  const typeHint = useMemo(() => {
    if (!canFetchReport) {
      return showEmployeeIdField
        ? 'Issue types match the Reports table — they load after you pick an employee and date.'
        : 'Issue types match the Reports table — they load after you pick a date.'
    }
    if (isFetchingReport) return 'Loading issues for this date from the attendance report…'
    if (reportLoaded && options.length === 0) {
      return 'This date has no issues on the report (Issues column shows —). Nothing to regularize.'
    }
    if (options.length > 0) {
      return `Same codes as Reports → Issues: ${options.map((o) => o.value).join(', ')}.`
    }
    return 'Choose the issue you are regularizing.'
  }, [canFetchReport, isFetchingReport, options, reportLoaded, showEmployeeIdField])

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
      noValidate
    >
      {showEmployeeIdField ? (
        <AttendanceReportEmployeePicker
          selectedCode={employeeCode}
          selectedName={employeeDisplayName}
          label="Employee roster"
          disabled={disabled}
          onSelect={onRosterSelect}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reg-attendance-date">Attendance date</Label>
          <Input
            id="reg-attendance-date"
            type="date"
            disabled={disabled}
            value={values.attendanceDate}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                attendanceDate: event.target.value,
                type: '',
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Type (report issue)</Label>
          <Select
            value={values.type || undefined}
            disabled={typeSelectDisabled || !hasReportIssues}
            onValueChange={(type) => setValues((prev) => ({ ...prev, type }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={typePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="font-mono text-[12px]">{option.value}</span>
                  <span className="ml-2 text-text-secondary">({option.label})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-text-secondary">{typeHint}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-reason">Reason</Label>
        <Textarea
          id="reg-reason"
          disabled={disabled}
          placeholder="Why regularization is needed"
          value={values.reason}
          onChange={(event) => setValues((prev) => ({ ...prev, reason: event.target.value }))}
        />
      </div>

      {fieldError ? <p className="text-xs text-[#EF4444]">{fieldError}</p> : null}

      <Button type="submit" disabled={submitDisabled}>
        Submit request
      </Button>
    </form>
  )
}