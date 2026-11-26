/**
 * Identity, limits, and behaviour fields for ApiLeaveTypeDialog.
 */

import { cn } from '@/lib/utils'

import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { ApiLeaveTypeDialogMode } from './leaveTypeDialogForm'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_TEXTAREA, LEAVE_SETTINGS_NUMBER_INPUT } from '../../shared/leaveUi'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import {
  LEAVE_TYPE_CODE_MAX_LEN,
  normalizeLeaveTypeCode,
  type LeaveTypeFormState,
} from './leaveTypeDialogForm'
import {
  LeaveTypeApprovalReadOnly,
  LeaveTypeFormSection,
  LeaveTypePolicyCards,
} from './LeaveTypeDialogUi'

const INPUT_CLASS = cn(
  LEAVE_DIALOG_INPUT,
  'placeholder:text-hrms-text-secondary/80 disabled:cursor-not-allowed disabled:bg-hrms-muted-bg/60',
)

type Props = {
  mode: ApiLeaveTypeDialogMode
  initial: LeaveTypeOption | null
  form: LeaveTypeFormState
  loading?: boolean
  codeErr: string | null
  nameErr: string | null
  maxError: string | null
  touched: { code: boolean; name: boolean; max: boolean }
  onPatch: (patch: Partial<LeaveTypeFormState>) => void
  onTouch: (key: 'code' | 'name' | 'max') => void
  onMaxErrorClear: () => void
}

export function LeaveTypeDialogFormBody({
  mode,
  initial,
  form,
  loading,
  codeErr,
  nameErr,
  maxError,
  touched,
  onPatch,
  onTouch,
  onMaxErrorClear,
}: Props) {
  return (
    <>
      <LeaveTypeFormSection title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <LeaveDialogField label="Code" htmlFor="lt-code" required error={codeErr ?? undefined} touched={touched.code}>
            <input
              id="lt-code"
              className={cn(INPUT_CLASS, 'font-mono tracking-wide')}
              value={form.code}
              disabled={mode === 'edit' || loading}
              onChange={(e) => onPatch({ code: normalizeLeaveTypeCode(e.target.value) })}
              onBlur={() => onTouch('code')}
              placeholder="e.g. CL"
              autoComplete="off"
              maxLength={LEAVE_TYPE_CODE_MAX_LEN}
              spellCheck={false}
            />
            <p className="mt-1.5 text-xs text-hrms-text-secondary">
              {mode === 'edit' ? 'Code is fixed after creation.' : `${LEAVE_TYPE_CODE_MAX_LEN} chars max · letters and numbers only`}
            </p>
          </LeaveDialogField>
          <LeaveDialogField label="Name" htmlFor="lt-name" required error={nameErr ?? undefined} touched={touched.name}>
            <input
              id="lt-name"
              className={INPUT_CLASS}
              value={form.name}
              disabled={loading}
              onChange={(e) => onPatch({ name: e.target.value })}
              onBlur={() => onTouch('name')}
              placeholder="e.g. Casual Leave"
            />
          </LeaveDialogField>
        </div>
        <LeaveDialogField label="Description" htmlFor="lt-desc">
          <textarea
            id="lt-desc"
            rows={2}
            className={cn(LEAVE_DIALOG_TEXTAREA, 'resize-y placeholder:text-hrms-text-secondary/80')}
            value={form.description}
            disabled={loading}
            onChange={(e) => onPatch({ description: e.target.value })}
            placeholder="Optional notes for HR (not shown to employees)"
          />
        </LeaveDialogField>
      </LeaveTypeFormSection>

      <LeaveTypeFormSection title="Limits">
        <LeaveDialogField label="Max days per request" htmlFor="lt-max" error={maxError ?? undefined} touched={touched.max}>
          <input
            id="lt-max"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={LEAVE_SETTINGS_NUMBER_INPUT}
            value={form.maxAllowedDays}
            disabled={loading}
            onChange={(e) => {
              onMaxErrorClear()
              onPatch({ maxAllowedDays: e.target.value })
            }}
            onBlur={() => onTouch('max')}
            placeholder="No limit"
          />
          <p className="mt-1.5 text-xs text-hrms-text-secondary">
            Whole days only. Leave blank if a single request may span any duration allowed by balance.
          </p>
        </LeaveDialogField>
      </LeaveTypeFormSection>

      <LeaveTypeFormSection title="Behaviour">
        <LeaveTypePolicyCards form={form} loading={loading} onChange={onPatch} />
        {mode === 'edit' && initial ? <LeaveTypeApprovalReadOnly requiresApproval={initial.requiresApproval} /> : null}
        {mode === 'create' ? (
          <p className="text-xs leading-relaxed text-hrms-text-secondary">
            Approval rules are assigned by the server after the type is created.
          </p>
        ) : null}
      </LeaveTypeFormSection>
    </>
  )
}