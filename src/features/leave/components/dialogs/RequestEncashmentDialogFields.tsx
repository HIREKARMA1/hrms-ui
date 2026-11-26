/**
 * Encashment request form fields (My Leave / API submit dialog).
 */

import { cn } from '@/lib/utils'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import type { EncashmentRequestForm } from '../../utils/buildCreateEncashmentBody'
import { LeaveDialogField } from '../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT } from '../shared/leaveUi'

type Props = {
  form: EncashmentRequestForm
  encashableTypes: LeaveTypeOption[]
  balance: number
  after: number
  validationError: string | false | null
  onPatch: (patch: Partial<EncashmentRequestForm>) => void
}

export function RequestEncashmentDialogFields({
  form,
  encashableTypes,
  balance,
  after,
  validationError,
  onPatch,
}: Props) {
  return (
    <>
      <LeaveDialogField label="Leave type" htmlFor="api-enc-type">
        <select
          id="api-enc-type"
          className={cn(LEAVE_DIALOG_SELECT)}
          value={form.leaveTypeId}
          onChange={(event) => onPatch({ leaveTypeId: event.target.value })}
        >
          {encashableTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.code} · {type.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-hrms-text-muted">
          Paid leave types only. Minimum balance and limits are enforced by the server.
        </p>
      </LeaveDialogField>

      <LeaveDialogField label="Days to encash" htmlFor="api-enc-days">
        <input
          id="api-enc-days"
          type="number"
          min={1}
          className={cn(LEAVE_DIALOG_INPUT)}
          value={form.days}
          onChange={(event) => onPatch({ days: event.target.value })}
        />
      </LeaveDialogField>

      <LeaveDialogField label="Year (optional)" htmlFor="api-enc-year">
        <input
          id="api-enc-year"
          type="text"
          inputMode="numeric"
          className={cn(LEAVE_DIALOG_INPUT)}
          value={form.year}
          onChange={(event) => onPatch({ year: event.target.value })}
        />
      </LeaveDialogField>

      <LeaveDialogField label="Reason (optional)" htmlFor="api-enc-reason">
        <input
          id="api-enc-reason"
          type="text"
          className={cn(LEAVE_DIALOG_INPUT)}
          value={form.reason}
          onChange={(event) => onPatch({ reason: event.target.value })}
        />
      </LeaveDialogField>

      <p className="text-sm tabular-nums text-hrms-text-secondary">
        Available: {balance} days · After request: {after} days
      </p>
      {validationError ? <p className="text-xs text-hrms-danger">{validationError}</p> : null}
    </>
  )
}