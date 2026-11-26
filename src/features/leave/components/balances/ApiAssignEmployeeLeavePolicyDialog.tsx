/**
 * POST /employee-leave-policies — assign or update entitlement for one employee and leave type.
 */

import { FileBadge } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import type { BackendGrantMode } from '../../api/leaveApi.types'
import { useEmployeeLeavePolicyActions } from '../../hooks/useEmployeeLeavePolicyActions'
import {
  buildAssignEmployeeLeavePolicyBody,
  defaultEmployeeLeavePolicyEffectiveFrom,
} from '../../utils/buildEmployeeLeavePolicyBody'
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

type ApiAssignEmployeeLeavePolicyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  employeeName: string
  year: number
  leaveTypes: LeaveTypeOption[]
  onSaved: (message: string) => void
}

export function ApiAssignEmployeeLeavePolicyDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  year,
  leaveTypes,
  onSaved,
}: ApiAssignEmployeeLeavePolicyDialogProps) {
  const actions = useEmployeeLeavePolicyActions()
  const activeTypes = leaveTypes.filter((type) => type.isActive)
  const [leaveTypeId, setLeaveTypeId] = useState(activeTypes[0]?.id ?? '')
  const [useCompanyDefaults, setUseCompanyDefaults] = useState(true)
  const [grantMode, setGrantMode] = useState<BackendGrantMode>('MONTHLY_ACCRUAL')
  const [annualEntitlement, setAnnualEntitlement] = useState('12')
  const [monthlyAccrualAmount, setMonthlyAccrualAmount] = useState('1')
  const [notes, setNotes] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(() => defaultEmployeeLeavePolicyEffectiveFrom(year))
  const [effectiveTo, setEffectiveTo] = useState('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const built = buildAssignEmployeeLeavePolicyBody({
    employeeId,
    leaveTypeId,
    year,
    useCompanyDefaults,
    grantMode,
    annualEntitlement,
    monthlyAccrualAmount,
    notes,
    effectiveFrom,
    effectiveTo,
  })
  const fieldError = built.ok ? undefined : built.error

  async function save() {
    setTouched(true)
    if (!built.ok) return
    setSaving(true)
    setServerError(null)
    const result = await actions.assignPolicy(built.body)
    setSaving(false)
    if (!result.ok) {
      setServerError(result.message)
      return
    }
    onSaved('Employee leave policy saved.')
    onOpenChange(false)
  }

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="sm">
        <LeaveDialogHeader title="Assign leave policy" subtitle={`${employeeName} · ${year}`} icon={FileBadge} />
        <LeaveDialogBody className="space-y-3">
          <LeaveDialogField label="Leave type" htmlFor="assign-policy-type">
            <select
              id="assign-policy-type"
              className={cn(LEAVE_DIALOG_SELECT)}
              value={leaveTypeId}
              onChange={(event) => setLeaveTypeId(event.target.value)}
            >
              {activeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
          </LeaveDialogField>
          <LeaveDialogField label="Effective from" htmlFor="assign-policy-effective-from">
            <input
              id="assign-policy-effective-from"
              type="date"
              className={cn(LEAVE_DIALOG_INPUT)}
              value={effectiveFrom}
              onChange={(event) => setEffectiveFrom(event.target.value)}
            />
          </LeaveDialogField>
          <LeaveDialogField label="Effective to (optional)" htmlFor="assign-policy-effective-to">
            <input
              id="assign-policy-effective-to"
              type="date"
              className={cn(LEAVE_DIALOG_INPUT)}
              value={effectiveTo}
              onChange={(event) => setEffectiveTo(event.target.value)}
            />
          </LeaveDialogField>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-hrms-text-secondary">
            <input
              type="checkbox"
              className="mt-1"
              checked={useCompanyDefaults}
              onChange={(event) => setUseCompanyDefaults(event.target.checked)}
            />
            Use active company defaults for this leave type
          </label>
          {!useCompanyDefaults ? (
            <>
              <LeaveDialogField label="Grant mode" htmlFor="assign-policy-grant">
                <select
                  id="assign-policy-grant"
                  className={cn(LEAVE_DIALOG_SELECT)}
                  value={grantMode}
                  onChange={(event) => setGrantMode(event.target.value as BackendGrantMode)}
                >
                  <option value="MONTHLY_ACCRUAL">Monthly accrual</option>
                  <option value="ANNUAL_GRANT">Annual grant</option>
                </select>
              </LeaveDialogField>
              <LeaveDialogField label="Annual entitlement (days)" htmlFor="assign-policy-annual">
                <input
                  id="assign-policy-annual"
                  className={cn(LEAVE_DIALOG_INPUT)}
                  inputMode="decimal"
                  value={annualEntitlement}
                  onChange={(event) => setAnnualEntitlement(event.target.value)}
                />
              </LeaveDialogField>
              <LeaveDialogField label="Monthly accrual (days)" htmlFor="assign-policy-monthly">
                <input
                  id="assign-policy-monthly"
                  className={cn(LEAVE_DIALOG_INPUT)}
                  inputMode="decimal"
                  value={monthlyAccrualAmount}
                  onChange={(event) => setMonthlyAccrualAmount(event.target.value)}
                />
              </LeaveDialogField>
              <LeaveDialogField label="Notes (optional)" htmlFor="assign-policy-notes">
                <textarea
                  id="assign-policy-notes"
                  rows={2}
                  className={cn(LEAVE_DIALOG_TEXTAREA)}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </LeaveDialogField>
            </>
          ) : null}
          {touched && fieldError ? (
            <p className="text-xs text-hrms-danger" role="alert">
              {fieldError}
            </p>
          ) : null}
          {serverError ? (
            <p className="text-xs text-hrms-danger" role="alert">
              {serverError}
            </p>
          ) : null}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions primaryLabel="Save policy" loading={saving} onPrimary={() => void save()} />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}