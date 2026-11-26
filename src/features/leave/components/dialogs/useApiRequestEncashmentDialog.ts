/**
 * State and submit logic for ApiRequestEncashmentDialog.
 */

import { useEffect, useMemo, useState } from 'react'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import { useLeaveApiActions } from '../../hooks/useLeaveApiActions'
import { useLeaveToast } from '../../hooks/useLeaveToast'
import { buildCreateEncashmentBody, type EncashmentRequestForm } from '../../utils/buildCreateEncashmentBody'
import { parsePositiveWholeDays } from '../../utils/buildLeavePolicyApiBody'
import { encashableLeaveTypes } from '../../utils/encashableLeaveTypes'
import { validateEncashmentRequestBalance } from '../../utils/encashmentRequestPolicy'
import { ENCASHMENT_SUBMIT_FAIL_TOAST, formatEncashmentSubmitError } from '../../utils/formatEncashmentSubmitError'
import { leaveTodayIso } from '../../utils/leaveToday'

const EMPTY_FORM: EncashmentRequestForm = {
  leaveTypeId: '',
  days: '1',
  year: '',
  reason: '',
}

export function useApiRequestEncashmentDialog(
  open: boolean,
  employeeId: string,
  leaveTypes: LeaveTypeOption[],
  balanceByCode: Record<string, number> | undefined,
  onOpenChange: (open: boolean) => void,
  onSuccess?: () => void,
) {
  const actions = useLeaveApiActions()
  const { showToast } = useLeaveToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const today = leaveTodayIso()

  const encashableTypes = useMemo(() => encashableLeaveTypes(leaveTypes), [leaveTypes])

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setSubmitError(null)
      return
    }
    const first = encashableTypes[0]
    setForm({ ...EMPTY_FORM, leaveTypeId: first?.id ?? '', year: today.slice(0, 4) })
    setSubmitError(null)
  }, [open, encashableTypes, today])

  const selected = encashableTypes.find((t) => t.id === form.leaveTypeId)
  const balance = selected ? (balanceByCode?.[selected.code] ?? 0) : 0
  const daysParsed = parsePositiveWholeDays(form.days)
  const days = daysParsed === 'invalid' || daysParsed === 'empty' ? 0 : daysParsed
  const after = balance - days
  const validationError =
    daysParsed === 'invalid' ? 'Enter a whole number of days.' : validateEncashmentRequestBalance(balance, days)

  function patchForm(patch: Partial<EncashmentRequestForm>) {
    setSubmitError(null)
    setForm((prev) => ({ ...prev, ...patch }))
  }

  async function handleSubmit() {
    const body = buildCreateEncashmentBody(employeeId, form)
    if (!body || validationError) return
    setSubmitError(null)
    setSaving(true)
    const result = await actions.createEncashment(body)
    setSaving(false)
    if (result.ok) {
      showToast('Encashment request submitted.')
      onOpenChange(false)
      onSuccess?.()
      return
    }
    setSubmitError(formatEncashmentSubmitError(result.message))
    showToast(ENCASHMENT_SUBMIT_FAIL_TOAST)
  }

  const noTypes = encashableTypes.length === 0

  return {
    form,
    patchForm,
    encashableTypes,
    balance,
    after,
    validationError,
    submitError,
    saving,
    noTypes,
    handleSubmit,
  }
}