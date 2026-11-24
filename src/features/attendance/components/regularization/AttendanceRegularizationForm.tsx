/**
 * Create regularization — POST /attendance/employees/{employeeId}/regularizations.
 */
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
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

import { REGULARIZATION_TYPE_OPTIONS } from '../../constants/regularizationUi'
import type { AttendanceRegularizationType } from '../../constants/attendanceApiAccess'

export type AttendanceRegularizationFormValues = {
  employeeId: string
  attendanceDate: string
  type: AttendanceRegularizationType | ''
  reason: string
}

type AttendanceRegularizationFormProps = {
  showEmployeeIdField: boolean
  defaultEmployeeId?: string
  disabled?: boolean
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
  onSubmit,
}: AttendanceRegularizationFormProps) {
  const [values, setValues] = useState(() => emptyValues(defaultEmployeeId))
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!values.attendanceDate) {
      setFieldError('Attendance date is required.')
      return
    }
    if (!values.type) {
      setFieldError('Regularization type is required.')
      return
    }
    if (!values.reason.trim()) {
      setFieldError('Reason is required.')
      return
    }
    if (showEmployeeIdField && !values.employeeId.trim()) {
      setFieldError('Employee ID (UUID) is required for HR submissions.')
      return
    }
    setFieldError(null)
    await onSubmit(values)
    setValues(emptyValues(defaultEmployeeId))
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
      noValidate
    >
      {showEmployeeIdField ? (
        <div className="space-y-2">
          <Label htmlFor="reg-employee-id">Employee ID (UUID)</Label>
          <Input
            id="reg-employee-id"
            value={values.employeeId}
            disabled={disabled}
            placeholder="Server employee UUID"
            onChange={(event) => setValues((prev) => ({ ...prev, employeeId: event.target.value }))}
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reg-attendance-date">Attendance date</Label>
          <Input
            id="reg-attendance-date"
            type="date"
            disabled={disabled}
            value={values.attendanceDate}
            onChange={(event) => setValues((prev) => ({ ...prev, attendanceDate: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={values.type || undefined}
            disabled={disabled}
            onValueChange={(type) =>
              setValues((prev) => ({ ...prev, type: type as AttendanceRegularizationType }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {REGULARIZATION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <Button type="submit" disabled={disabled}>
        Submit request
      </Button>
    </form>
  )
}