/**
 * Create an accrual policy (POST /leave-policies/accrual).
 */

import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'

import type { CreateAccrualPolicyBody } from '../../api/leaveApi.types'
import type { LeaveTypeOption } from '../../api/leaveMappers'
import { buildAccrualPolicyCreateBody, parsePolicyDecimal, type AccrualPolicyForm } from '../../utils/buildLeavePolicyApiBody'
import { leaveTodayIso } from '../../utils/leaveToday'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { AccrualPolicyFormBody } from './policyDialog/AccrualPolicyFormBody'
import { EMPTY_ACCRUAL_POLICY_FORM } from './policyDialog/accrualPolicyFormDefaults'
import { PolicyPreviewStrip, PolicySaveErrorBanner } from './policyDialog/PolicyDialogShared'

type Props = {
  open: boolean
  leaveTypes: LeaveTypeOption[]
  saveError?: string | null
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (body: CreateAccrualPolicyBody) => void
}

export function ApiAccrualPolicyDialog({ open, leaveTypes, saveError, loading, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<AccrualPolicyForm>(EMPTY_ACCRUAL_POLICY_FORM)
  const [touched, setTouched] = useState({ leaveType: false, amount: false, from: false })

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_ACCRUAL_POLICY_FORM)
      setTouched({ leaveType: false, amount: false, from: false })
      return
    }
    setForm({ ...EMPTY_ACCRUAL_POLICY_FORM, effectiveFrom: leaveTodayIso() })
  }, [open])

  const patchForm = (patch: Partial<AccrualPolicyForm>) => setForm((prev) => ({ ...prev, ...patch }))
  const patchTouched = (patch: Partial<typeof touched>) => setTouched((prev) => ({ ...prev, ...patch }))

  const amountParsed = parsePolicyDecimal(form.accrualAmount)
  const amountErr =
    touched.amount && (amountParsed === 'invalid' || amountParsed === null)
      ? 'Enter the days credited per accrual period (e.g. 1 or 1.5).'
      : null
  const fromErr = touched.from && !form.effectiveFrom.trim() ? 'Effective from date is required.' : null
  const typeErr = touched.leaveType && !form.leaveTypeId ? 'Choose a leave type.' : null

  const activeTypes = leaveTypes.filter((t) => t.isActive)
  const selected = activeTypes.find((t) => t.id === form.leaveTypeId)

  function handleSubmit() {
    setTouched({ leaveType: true, amount: true, from: true })
    const body = buildAccrualPolicyCreateBody(form)
    if (!body) return
    onSubmit(body)
  }

  const canSave = Boolean(form.leaveTypeId && form.effectiveFrom.trim() && amountParsed !== 'invalid' && amountParsed !== null)

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md" className="shadow-xl">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader
          title="Add accrual policy"
          subtitle="Define how this leave type earns balance over time for eligible employees."
          icon={CalendarClock}
        />
        <LeaveDialogBody className="space-y-6 overscroll-contain [scrollbar-width:thin]">
          {saveError ? <PolicySaveErrorBanner message={saveError} /> : null}
          {selected ? (
            <PolicyPreviewStrip
              label={selected.code}
              name={selected.name}
              detail={form.frequency === 'MONTHLY' ? 'Monthly accrual' : 'Yearly accrual'}
            />
          ) : null}
          <AccrualPolicyFormBody
            form={form}
            loading={loading}
            activeTypes={activeTypes}
            touched={touched}
            typeErr={typeErr}
            amountErr={amountErr}
            fromErr={fromErr}
            setForm={patchForm}
            setTouched={patchTouched}
          />
        </LeaveDialogBody>
        <LeaveDialogFooter className="bg-hrms-muted-bg/35">
          <LeaveDialogFooterActions primaryLabel="Create accrual policy" loading={loading} primaryDisabled={!canSave} onPrimary={handleSubmit} />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}