import { useEffect, useState, type FormEvent } from 'react'

import { useOfficeCalendar } from './useOfficeCalendar'
import type { OfficeCalendarEvent, OfficeCalendarEventInput } from '../types/officeCalendar'
import {
  emptyOfficeEventInput,
  officeEventInputFromEvent,
} from '../utils/officeCalendarEventForm'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'

type UseOfficeEventFormDialogArgs = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: OfficeCalendarEvent | null
  defaultStartDate?: string
  onSaved?: (event: OfficeCalendarEvent) => void
  onOpenChange: (open: boolean) => void
}

export function useOfficeEventFormDialog({
  open,
  mode,
  initial,
  defaultStartDate,
  onSaved,
  onOpenChange,
}: UseOfficeEventFormDialogArgs) {
  const { saveEvent } = useOfficeCalendar()
  const { showToast } = useOfficeCalendarToast()
  const [draft, setDraft] = useState<OfficeCalendarEventInput>(emptyOfficeEventInput())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(
      initial
        ? officeEventInputFromEvent(initial)
        : emptyOfficeEventInput(defaultStartDate ?? undefined),
    )
    setError(null)
  }, [open, initial, defaultStartDate])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft.title.trim()) {
      setError('Title is required.')
      return
    }
    if (!draft.startDate || !draft.endDate) {
      setError('Start and end dates are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await saveEvent(draft, mode === 'edit' ? initial?.id : undefined)
      showToast(mode === 'edit' ? 'Event updated.' : 'Event scheduled.')
      onSaved?.(saved)
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save event.')
    } finally {
      setSaving(false)
    }
  }

  return { draft, setDraft, error, saving, handleSubmit }
}