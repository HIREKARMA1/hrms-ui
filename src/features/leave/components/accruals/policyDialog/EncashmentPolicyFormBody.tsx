import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { EncashmentPolicyForm } from '../../../utils/buildCreateEncashmentPolicyBody'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT } from '../../shared/leaveUi'
import { cn } from '@/lib/utils'

type Props = {
  form: EncashmentPolicyForm
  loading?: boolean
  encashableTypes: LeaveTypeOption[]
  typeErr: string | null
  rateErr: string | null
  fromErr: string | null
  setForm: (patch: Partial<EncashmentPolicyForm>) => void
  onBlurType?: () => void
  onBlurRate?: () => void
  onBlurFrom?: () => void
}

export function EncashmentPolicyFormBody({
  form,
  loading,
  encashableTypes,
  typeErr,
  rateErr,
  fromErr,
  setForm,
  onBlurType,
  onBlurRate,
  onBlurFrom,
}: Props) {
  const disabled = Boolean(loading)
  return (
  <>
      <LeaveDialogField label="Leave type" htmlFor="enc-pol-type" error={typeErr ?? undefined}>
        <select
          id="enc-pol-type"
          className={cn(LEAVE_DIALOG_SELECT)}
          disabled={disabled}
          value={form.leaveTypeId}
          onBlur={onBlurType}
          onChange={(event) => setForm({ leaveTypeId: event.target.value })}
        >
          <option value="">Select paid leave type</option>
          {encashableTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.code} · {type.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-hrms-text-muted">
          Only active paid leave types appear. Unpaid leave cannot be encashed.
        </p>
      </LeaveDialogField>
      <div className="grid gap-4 sm:grid-cols-2">
        <LeaveDialogField label="Rate per day" htmlFor="enc-pol-rate" error={rateErr ?? undefined}>
          <input
            id="enc-pol-rate"
            type="text"
            inputMode="decimal"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.ratePerDay}
            onBlur={onBlurRate}
            onChange={(event) => setForm({ ratePerDay: event.target.value })}
          />
        </LeaveDialogField>
        <LeaveDialogField label="Currency" htmlFor="enc-pol-cur">
          <input
            id="enc-pol-cur"
            type="text"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.currency}
            onChange={(event) => setForm({ currency: event.target.value })}
          />
        </LeaveDialogField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <LeaveDialogField label="Min days (balance)" htmlFor="enc-pol-min">
          <input
            id="enc-pol-min"
            type="text"
            inputMode="numeric"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.minDays}
            onChange={(event) => setForm({ minDays: event.target.value })}
          />
        </LeaveDialogField>
        <LeaveDialogField label="Max per request" htmlFor="enc-pol-max-req">
          <input
            id="enc-pol-max-req"
            type="text"
            inputMode="numeric"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.maxDaysPerRequest}
            onChange={(event) => setForm({ maxDaysPerRequest: event.target.value })}
          />
        </LeaveDialogField>
        <LeaveDialogField label="Max per year (optional)" htmlFor="enc-pol-max-yr">
          <input
            id="enc-pol-max-yr"
            type="text"
            inputMode="numeric"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.maxDaysPerYear}
            onChange={(event) => setForm({ maxDaysPerYear: event.target.value })}
          />
        </LeaveDialogField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <LeaveDialogField label="Effective from" htmlFor="enc-pol-from" error={fromErr ?? undefined}>
          <input
            id="enc-pol-from"
            type="date"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.effectiveFrom}
            onBlur={onBlurFrom}
            onChange={(event) => setForm({ effectiveFrom: event.target.value })}
          />
        </LeaveDialogField>
        <LeaveDialogField label="Effective to (optional)" htmlFor="enc-pol-to">
          <input
            id="enc-pol-to"
            type="date"
            className={cn(LEAVE_DIALOG_INPUT)}
            disabled={disabled}
            value={form.effectiveTo}
            onChange={(event) => setForm({ effectiveTo: event.target.value })}
          />
        </LeaveDialogField>
      </div>
      <label className="flex items-center gap-2 text-sm text-hrms-text-secondary">
        <input
          type="checkbox"
          checked={form.isActive}
          disabled={disabled}
          onChange={(event) => setForm({ isActive: event.target.checked })}
        />
        Policy is active
      </label>
    </>
  )
}