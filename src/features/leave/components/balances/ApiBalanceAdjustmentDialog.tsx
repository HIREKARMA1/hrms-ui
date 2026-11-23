/**
 * Server balance adjustment (POST /employee-leave-policies/adjustments).
 * Positive amounts add entitled days for the year, negative amounts deduct.
 */

import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { buildAdjustmentBody, type LeaveTypeOption } from '../../api/leaveMappers'
import { useLeaveApiActions } from '../../hooks/useLeaveApiActions'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT, LEAVE_DIALOG_TEXTAREA } from '../shared/leaveUi'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'

type ApiBalanceAdjustmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  employeeName: string
  year: number
  leaveTypes: LeaveTypeOption[]
  onSaved: (message: string) => void
}

export function ApiBalanceAdjustmentDialog({ open, onOpenChange, employeeId, employeeName, year, leaveTypes, onSaved }: ApiBalanceAdjustmentDialogProps) {
  const actions = useLeaveApiActions()
  const activeTypes = leaveTypes.filter((type) => type.isActive)
  const [leaveTypeId, setLeaveTypeId] = useState(activeTypes[0]?.id ?? '')
  const [amount, setAmount] = useState('1')
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const built = buildAdjustmentBody({ employeeId, leaveTypeId, year, amount, reason })
  const fieldError = built.ok ? undefined : built.error

  async function save() {
    setTouched(true)
    if (!built.ok) return
    setSaving(true)
    setServerError(null)
    const result = await actions.adjustBalance(built.body)
    setSaving(false)
    if (!result.ok) {
      setServerError(result.message)
      return
    }
    onSaved(
      result.entitledDays === undefined
        ? 'Adjustment saved.'
        : `Adjustment saved. Entitled days for ${year} are now ${result.entitledDays}.`,
    )
    onOpenChange(false)
  }

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogHeader title="Add adjustment" subtitle={`${employeeName} · ${year}`} icon={PlusCircle} />
        <LeaveDialogBody className="space-y-3">
          <LeaveDialogField label="Type" htmlFor="api-adj-type">
            <select id="api-adj-type" className={cn(LEAVE_DIALOG_SELECT)} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
              {activeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Days" htmlFor="api-adj-days">
            <input id="api-adj-days" type="number" step="0.5" className={LEAVE_DIALOG_INPUT} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </LeaveDialogField>
          <LeaveDialogField label="Reason" htmlFor="api-adj-reason" required error={fieldError} touched={touched}>
            <textarea id="api-adj-reason" rows={3} maxLength={1000} className={LEAVE_DIALOG_TEXTAREA} value={reason} onChange={(e) => setReason(e.target.value)} />
          </LeaveDialogField>
          {serverError ? (
            <p role="alert" className="text-sm text-hrms-danger">
              {serverError}
            </p>
          ) : null}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Save" loading={saving} primaryDisabled={activeTypes.length === 0} onPrimary={() => void save()} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
