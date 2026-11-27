/**
 * Create a carry-forward policy (POST /leave-policies/carry-forward).
 */

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import type { CreateCarryForwardPolicyBody } from '../../api/leaveApi.types'
import type { LeaveTypeOption } from '../../api/leaveMappers'
import {
  buildCarryForwardPolicyCreateBody,
  parsePolicyWholeDays,
  parsePolicyYear,
  parsePositiveWholeDays,
  type CarryForwardPolicyForm,
} from '../../utils/buildLeavePolicyApiBody'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { EMPTY_CARRY_FORWARD_POLICY_FORM } from './policyDialog/accrualPolicyFormDefaults'
import { CarryForwardPolicyFormBody } from './policyDialog/CarryForwardPolicyFormBody'
import { PolicyPreviewStrip, PolicySaveErrorBanner } from './policyDialog/PolicyDialogShared'

type Props = {
  open: boolean
  leaveTypes: LeaveTypeOption[]
  defaultYear: number
  saveError?: string | null
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (body: CreateCarryForwardPolicyBody) => void
}

export function ApiCarryForwardPolicyDialog({
  open,
  leaveTypes,
  defaultYear,
  saveError,
  loading,
  onOpenChange,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CarryForwardPolicyForm>(EMPTY_CARRY_FORWARD_POLICY_FORM)
  const [touched, setTouched] = useState({ leaveType: false, max: false, year: false, months: false })

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_CARRY_FORWARD_POLICY_FORM)
      setTouched({ leaveType: false, max: false, year: false, months: false })
      return
    }
    setForm({ ...EMPTY_CARRY_FORWARD_POLICY_FORM, effectiveYear: String(defaultYear) })
  }, [open, defaultYear])

  const patchForm = (patch: Partial<CarryForwardPolicyForm>) => setForm((prev) => ({ ...prev, ...patch }))
  const patchTouched = (patch: Partial<typeof touched>) => setTouched((prev) => ({ ...prev, ...patch }))

  const maxParsed = parsePositiveWholeDays(form.maxCarryForwardDays)
  const maxErr =
    touched.max && (maxParsed === 'invalid' || maxParsed === 'empty')
      ? 'Enter a whole number of days (at least 1).'
      : null
  const yearParsed = parsePolicyYear(form.effectiveYear)
  const yearErr =
    touched.year && (yearParsed === 'invalid' || yearParsed === 'empty') ? 'Enter a four-digit year (e.g. 2026).' : null
  const typeErr = touched.leaveType && !form.leaveTypeId ? 'Choose a leave type.' : null
  const monthsParsed = parsePolicyWholeDays(form.expiryMonths)
  const monthsErr =
    !form.expiryNever && touched.months && monthsParsed === 'invalid' ? 'Expiry months must be a whole number.' : null

  const activeTypes = leaveTypes.filter((t) => t.isActive)
  const selected = activeTypes.find((t) => t.id === form.leaveTypeId)

  function handleSubmit() {
    setTouched({ leaveType: true, max: true, year: true, months: true })
    const body = buildCarryForwardPolicyCreateBody(form)
    if (!body) return
    onSubmit(body)
  }

  const canSave =
    Boolean(form.leaveTypeId) &&
    maxParsed !== 'invalid' &&
    maxParsed !== 'empty' &&
    yearParsed !== 'invalid' &&
    yearParsed !== 'empty' &&
    (form.expiryNever || (monthsParsed !== 'invalid' && monthsParsed !== null))

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md" className="shadow-xl">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader
          title="Add carry-forward policy"
          subtitle="Control how unused balance rolls from one year to the next."
          icon={RefreshCw}
        />
        <LeaveDialogBody className="space-y-6 overscroll-contain [scrollbar-width:thin]">
          {saveError ? <PolicySaveErrorBanner message={saveError} /> : null}
          {selected ? (
            <PolicyPreviewStrip label={selected.code} name={selected.name} detail={`Effective from ${form.effectiveYear || '—'}`} />
          ) : null}
          <CarryForwardPolicyFormBody
            form={form}
            loading={loading}
            activeTypes={activeTypes}
            touched={touched}
            typeErr={typeErr}
            maxErr={maxErr}
            yearErr={yearErr}
            monthsErr={monthsErr}
            setForm={patchForm}
            setTouched={patchTouched}
          />
        </LeaveDialogBody>
        <LeaveDialogFooter className="bg-hrms-muted-bg/35">
          <LeaveDialogFooterActions
            primaryLabel="Create carry-forward policy"
            loading={loading}
            primaryDisabled={!canSave}
            onPrimary={handleSubmit}
          />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}