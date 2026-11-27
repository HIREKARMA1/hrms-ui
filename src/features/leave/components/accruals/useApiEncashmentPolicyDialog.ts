/**
 * Form state for ApiEncashmentPolicyDialog (POST encashment policy).
 */

import { useEffect, useMemo, useState } from 'react'

import type { CreateEncashmentPolicyBody } from '../../api/leaveApi.types'
import type { LeaveTypeOption } from '../../api/leaveMappers'
import { buildCreateEncashmentPolicyBody } from '../../utils/buildCreateEncashmentPolicyBody'
import { parsePolicyDecimal } from '../../utils/buildLeavePolicyApiBody'
import { encashableLeaveTypes } from '../../utils/encashableLeaveTypes'
import { leaveTodayIso } from '../../utils/leaveToday'
import { EMPTY_ENCASHMENT_POLICY_FORM } from './policyDialog/encashmentPolicyFormDefaults'

export function useApiEncashmentPolicyDialog(
  open: boolean,
  leaveTypes: LeaveTypeOption[],
  onClearSaveError?: () => void,
  onSubmit?: (body: CreateEncashmentPolicyBody) => void,
) {
  const [form, setForm] = useState(EMPTY_ENCASHMENT_POLICY_FORM)
  const [touched, setTouched] = useState({ leaveType: false, rate: false, from: false })

  const encashableTypes = useMemo(() => encashableLeaveTypes(leaveTypes), [leaveTypes])

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ENCASHMENT_POLICY_FORM)
      setTouched({ leaveType: false, rate: false, from: false })
      return
    }
    const first = encashableTypes[0]
    setForm({
      ...EMPTY_ENCASHMENT_POLICY_FORM,
      leaveTypeId: first?.id ?? '',
      effectiveFrom: leaveTodayIso(),
    })
  }, [open, encashableTypes])

  function patchForm(patch: Partial<typeof form>) {
    if ('leaveTypeId' in patch) onClearSaveError?.()
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const rateParsed = parsePolicyDecimal(form.ratePerDay)
  const rateErr =
    touched.rate && (rateParsed === 'invalid' || rateParsed === null)
      ? 'Enter the payout rate per encashed day.'
      : null
  const fromErr = touched.from && !form.effectiveFrom.trim() ? 'Effective from date is required.' : null
  const typeErr = touched.leaveType && !form.leaveTypeId ? 'Choose a paid leave type.' : null

  function handleSubmit() {
    setTouched({ leaveType: true, rate: true, from: true })
    const body = buildCreateEncashmentPolicyBody(form)
    if (!body || !onSubmit) return
    onSubmit(body)
  }

  const canSave = Boolean(
    encashableTypes.length > 0 &&
      form.leaveTypeId &&
      form.effectiveFrom.trim() &&
      rateParsed !== 'invalid' &&
      rateParsed !== null,
  )

  return {
    form,
    encashableTypes,
    patchForm,
    rateErr,
    fromErr,
    typeErr,
    handleSubmit,
    canSave,
    setTouched,
  }
}