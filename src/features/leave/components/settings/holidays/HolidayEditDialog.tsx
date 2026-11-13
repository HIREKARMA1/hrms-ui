/**
 * Add or edit a single company holiday in Leave Settings.
 */

import { useState } from 'react'
import { Calendar } from 'lucide-react'

import type { Holiday, HolidayType } from '../../../types/holiday'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../../shared/LeaveDialog'
import { LEAVE_DIALOG_INPUT } from '../../shared/leaveUi'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'

type HolidayEditDialogProps = {
  open: boolean
  initial: Holiday | null
  takenDates: Set<string>
  onOpenChange: (open: boolean) => void
  onSave: (holiday: Holiday) => void
}

export function HolidayEditDialog({ open, initial, takenDates, onOpenChange, onSave }: HolidayEditDialogProps) {
  if (!open) {
    return <LeaveDialogRoot open={false} onOpenChange={onOpenChange} />
  }
  return (
    <HolidayEditDialogInner
      key={initial?.id ?? 'new'}
      initial={initial}
      takenDates={takenDates}
      onOpenChange={onOpenChange}
      onSave={onSave}
    />
  )
}

function HolidayEditDialogInner({
  initial,
  takenDates,
  onOpenChange,
  onSave,
}: Omit<HolidayEditDialogProps, 'open'>) {
  const [date, setDate] = useState(initial?.date ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [holidayType, setHolidayType] = useState<HolidayType>(initial?.holidayType ?? 'Public')
  const [error, setError] = useState('')

  function submit() {
    if (!name.trim()) {
      setError('Enter a holiday name.')
      return
    }
    if (!date) {
      setError('Pick a date.')
      return
    }
    if (takenDates.has(date) && initial?.date !== date) {
      setError('A holiday already exists on this date.')
      return
    }
    onSave({
      id: initial?.id ?? `HOL-${date}`,
      date,
      name: name.trim(),
      holidayType,
    })
    onOpenChange(false)
  }

  return (
    <LeaveDialogRoot open onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader title={initial ? 'Edit holiday' : 'Add holiday'} icon={Calendar} />
        <LeaveDialogBody className="space-y-4">
          <SettingsField label="Date" error={error}>
            <input type="date" className={LEAVE_DIALOG_INPUT} value={date} onChange={(event) => setDate(event.target.value)} />
          </SettingsField>
          <SettingsField label="Name">
            <input className={LEAVE_DIALOG_INPUT} value={name} onChange={(event) => setName(event.target.value)} />
          </SettingsField>
          <SettingsField label="Type" helper="Public holidays are usually statutory. Company holidays are decided by your organisation.">
            <SettingsSegmented
              ariaLabel="Holiday type"
              value={holidayType}
              onChange={(value) => setHolidayType(value as HolidayType)}
              options={[
                { value: 'Public', label: 'Public' },
                { value: 'Company', label: 'Company' },
              ]}
            />
          </SettingsField>
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel={initial ? 'Save' : 'Add'} onPrimary={submit} />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
