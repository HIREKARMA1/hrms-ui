import { useEffect, useState, type FormEvent } from 'react'

import { useGetHolidayByIdQuery } from '@/features/leave/api/holidaysApi'
import { getApiErrorMessage } from '@/services/api/errors'

import type { OfficeHoliday, OfficeHolidayInput } from '../types/officeCalendar'
import {
  emptyOfficeHolidayInput,
  officeHolidayInputFromHoliday,
} from '../utils/officeHolidayForm'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'
import { useShouldFetchHolidays } from './useShouldFetchHolidays'

type UseOfficeHolidayFormDialogArgs = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: OfficeHoliday | null
  onSave: (input: OfficeHolidayInput, id?: string) => Promise<OfficeHoliday>
  onOpenChange: (open: boolean) => void
  /** When true, edit mode loads GET /holidays/{id} while open. */
  useLiveApi?: boolean
}

export function useOfficeHolidayFormDialog({
  open,
  mode,
  initial,
  onSave,
  onOpenChange,
  useLiveApi = false,
}: UseOfficeHolidayFormDialogArgs) {
  const { showToast } = useOfficeCalendarToast()
  const canFetchHolidays = useShouldFetchHolidays()
  const shouldFetchDetail = Boolean(
    open && useLiveApi && canFetchHolidays && mode === 'edit' && initial?.id,
  )
  const {
    data: liveHoliday,
    isError: detailIsError,
    error: detailError,
    isFetching: detailFetching,
  } = useGetHolidayByIdQuery(initial?.id ?? '', { skip: !shouldFetchDetail })

  const [draft, setDraft] = useState<OfficeHolidayInput>(emptyOfficeHolidayInput())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const detailErrorMessage =
    shouldFetchDetail && detailIsError
      ? getApiErrorMessage(detailError, 'Could not load holiday details. Showing list data.')
      : null

  useEffect(() => {
    if (!open) return
    setError(null)
    if (shouldFetchDetail && detailFetching) {
      return
    }
    if (shouldFetchDetail && liveHoliday && !detailIsError) {
      setDraft(officeHolidayInputFromHoliday(liveHoliday))
      return
    }
    setDraft(initial ? officeHolidayInputFromHoliday(initial) : emptyOfficeHolidayInput())
  }, [
    open,
    initial,
    shouldFetchDetail,
    liveHoliday,
    detailIsError,
    detailFetching,
  ])

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

  return {
    draft,
    setDraft,
    error,
    saving,
    handleSubmit,
    detailFetching: shouldFetchDetail && detailFetching,
    detailErrorMessage,
  }
}