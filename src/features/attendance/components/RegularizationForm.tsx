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

export type RegularizationFormValues = {
  attendanceDate: string
  correctionType: string
  checkIn: string
  checkOut: string
  reason: string
}

type RegularizationFormProps = {
  onSubmit: (values: RegularizationFormValues) => void
}

const initialValues: RegularizationFormValues = {
  attendanceDate: '',
  correctionType: '',
  checkIn: '',
  checkOut: '',
  reason: '',
}

export function RegularizationForm({ onSubmit }: RegularizationFormProps) {
  const [values, setValues] = useState<RegularizationFormValues>(initialValues)
  const [errors, setErrors] = useState<Partial<RegularizationFormValues>>({})

  const validate = () => {
    const nextErrors: Partial<RegularizationFormValues> = {}
    if (!values.attendanceDate) nextErrors.attendanceDate = 'Attendance date is required.'
    if (!values.correctionType) nextErrors.correctionType = 'Correction type is required.'
    if (!values.checkIn) nextErrors.checkIn = 'Check-in time is required.'
    if (!values.checkOut) nextErrors.checkOut = 'Check-out time is required.'
    if (!values.reason.trim()) nextErrors.reason = 'Reason is required.'
    return nextErrors
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(values)
    setValues(initialValues)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attendance-date">Attendance Date</Label>
          <Input
            id="attendance-date"
            type="date"
            value={values.attendanceDate}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, attendanceDate: event.target.value }))
            }
          />
          {errors.attendanceDate ? (
            <p className="text-xs text-[#EF4444]">{errors.attendanceDate}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Correction Type</Label>
          <Select
            value={values.correctionType || undefined}
            onValueChange={(correctionType) =>
              setValues((prev) => ({ ...prev, correctionType }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select correction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Missed Check-in">Missed Check-in</SelectItem>
              <SelectItem value="Missed Check-out">Missed Check-out</SelectItem>
              <SelectItem value="Wrong Check-in">Wrong Check-in</SelectItem>
              <SelectItem value="Wrong Check-out">Wrong Check-out</SelectItem>
            </SelectContent>
          </Select>
          {errors.correctionType ? (
            <p className="text-xs text-[#EF4444]">{errors.correctionType}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="check-in">Actual Check-in</Label>
          <Input
            id="check-in"
            type="time"
            value={values.checkIn}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, checkIn: event.target.value }))
            }
          />
          {errors.checkIn ? (
            <p className="text-xs text-[#EF4444]">{errors.checkIn}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="check-out">Actual Check-out</Label>
          <Input
            id="check-out"
            type="time"
            value={values.checkOut}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, checkOut: event.target.value }))
            }
          />
          {errors.checkOut ? (
            <p className="text-xs text-[#EF4444]">{errors.checkOut}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          placeholder="Provide a reason for regularization"
          value={values.reason}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, reason: event.target.value }))
          }
        />
        {errors.reason ? (
          <p className="text-xs text-[#EF4444]">{errors.reason}</p>
        ) : null}
      </div>

      <Button type="submit">Submit Request</Button>
    </form>
  )
}
