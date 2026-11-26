/**
 * Form state and submit handler for ApiLeaveTypeDialog.
 */

import { useEffect, useState } from 'react'

import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { CreateLeaveTypeBody, UpdateLeaveTypeBody } from '../../../api/leaveApi.types'
import {
  buildLeaveTypeCreateBody,
  buildLeaveTypeUpdateBody,
  maxDaysFieldError,
  parseLeaveTypeMaxDays,
} from '../../../utils/buildLeaveTypeApiBody'
import {
  EMPTY_LEAVE_TYPE_FORM,
  leaveTypeCodeError,
  leaveTypeFormFromOption,
  normalizeLeaveTypeCode,
  type ApiLeaveTypeDialogMode,
  type LeaveTypeFormState,
} from './leaveTypeDialogForm'

export function useApiLeaveTypeDialogState(
  open: boolean,
  mode: ApiLeaveTypeDialogMode,
  initial: LeaveTypeOption | null,
  onSubmit: (payload: {
    mode: ApiLeaveTypeDialogMode
    id?: string
    body: CreateLeaveTypeBody | UpdateLeaveTypeBody
  }) => void,
) {
  const [form, setForm] = useState<LeaveTypeFormState>(EMPTY_LEAVE_TYPE_FORM)
  const [touched, setTouched] = useState({ code: false, name: false, max: false })
  const [maxError, setMaxError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setMaxError(null)
    setTouched({ code: false, name: false, max: false })
  }, [open])

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_LEAVE_TYPE_FORM)
      return
    }
    setForm(mode === 'edit' && initial ? leaveTypeFormFromOption(initial) : EMPTY_LEAVE_TYPE_FORM)
  }, [open, mode, initial])

  const patch = (patchForm: Partial<LeaveTypeFormState>) => setForm((prev) => ({ ...prev, ...patchForm }))
  const touch = (key: 'code' | 'name' | 'max') => setTouched((t) => ({ ...t, [key]: true }))

  const codeErr = mode === 'create' && touched.code ? leaveTypeCodeError(form.code, mode) : null
  const nameErr = touched.name && !form.name.trim() ? 'Name is required.' : null

  function handleSubmit() {
    setTouched({ code: true, name: true, max: true })
    const maxParsed = parseLeaveTypeMaxDays(form.maxAllowedDays)
    const maxFieldErr = maxDaysFieldError(maxParsed)
    if (maxFieldErr) {
      setMaxError(maxFieldErr)
      return
    }
    setMaxError(null)
    if (mode === 'create' && leaveTypeCodeError(form.code, mode)) return
    if (!form.name.trim()) return

    const slice = { ...form, code: normalizeLeaveTypeCode(form.code) }

    if (mode === 'create') {
      const body = buildLeaveTypeCreateBody(slice)
      if (!body) return
      onSubmit({ mode: 'create', body })
      return
    }
    if (!initial) return
    const body = buildLeaveTypeUpdateBody(slice)
    if (!body) return
    onSubmit({ mode: 'edit', id: initial.id, body })
  }

  const previewCode = mode === 'create' ? normalizeLeaveTypeCode(form.code) || '—' : form.code
  const previewName = form.name.trim() || 'Leave type name'
  const canSave =
    mode === 'create'
      ? Boolean(normalizeLeaveTypeCode(form.code).length >= 2 && form.name.trim())
      : Boolean(form.name.trim())

  return {
    form,
    patch,
    touch,
    codeErr,
    nameErr,
    maxError,
    touched,
    setMaxError,
    handleSubmit,
    previewCode,
    previewName,
    canSave,
  }
}