import { useEffect, useState, type FormEvent } from 'react'

import type { OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'
import {
  emptyOfficeHolidayInput,
  officeHolidayInputFromHoliday,
} from '../utils/officeHolidayForm'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'

type UseOfficeHolidayFormDialogArgs = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: OfficeHoliday | null
  onSave: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  onOpenChange: (open: boolean) => void
}

export function useOfficeHolidayFormDialog({
  open,
  mode,
  initial,
  onSave,
  onOpenChange,
}: UseOfficeHolidayFormDialogArgs) {
  const { showToast } = useOfficeCalendarToast()
  const [draft, setDraft] = useState<OfficeHolidayInput>(emptyOfficeHolidayInput())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(initial ? officeHolidayInputFromHoliday(initial) : emptyOfficeHolidayInput())
    setError(null)
  }, [open, initial])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.date) {
      setError('Name and date are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(draft, mode === 'edit' ? initial?.id : undefined)
      showToast(mode === 'edit' ? 'Holiday updated.' : 'Holiday added.')
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save holiday.')
    } finally {
      setSaving(false)
    }
  }

  return { draft, setDraft, error, saving, handleSubmit }
}