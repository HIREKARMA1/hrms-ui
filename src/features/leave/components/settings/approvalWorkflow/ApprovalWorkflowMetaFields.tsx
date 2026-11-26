/**
 * Name, description, leave type, and active toggle for workflow dialog.
 */

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { LeaveTypeOption } from '../../../api/leaveMappers'
import type { ApprovalWorkflowForm } from '../../../utils/buildApprovalWorkflowApiBody'
import { workflowLeaveTypeInactiveMessage } from '../../../utils/workflowLeaveTypeOptions'
import { LeaveDialogField } from '../../shared/LeaveDialogField'
import { LEAVE_DIALOG_INPUT, LEAVE_DIALOG_SELECT, LEAVE_DIALOG_TEXTAREA } from '../../shared/leaveUi'

type Props = {
  form: ApprovalWorkflowForm
  activeLeaveTypes: LeaveTypeOption[]
  selectedLeaveType: LeaveTypeOption | undefined
  leaveTypeInactive: boolean
  onFormChange: (patch: Partial<ApprovalWorkflowForm>) => void
  onClearErrors?: () => void
}

export function ApprovalWorkflowMetaFields({
  form,
  activeLeaveTypes,
  selectedLeaveType,
  leaveTypeInactive,
  onFormChange,
  onClearErrors,
}: Props) {
  const clear = () => onClearErrors?.()

  return (
    <>
      <LeaveDialogField label="Name" htmlFor="wf-name">
        <input
          id="wf-name"
          className={cn(LEAVE_DIALOG_INPUT)}
          value={form.name}
          onChange={(event) => {
            clear()
            onFormChange({ name: event.target.value })
          }}
        />
      </LeaveDialogField>
      <LeaveDialogField label="Description (optional)" htmlFor="wf-desc">
        <textarea
          id="wf-desc"
          rows={2}
          className={cn(LEAVE_DIALOG_TEXTAREA)}
          value={form.description}
          onChange={(event) => onFormChange({ description: event.target.value })}
        />
      </LeaveDialogField>
      <LeaveDialogField label="Leave type" htmlFor="wf-type">
        <select
          id="wf-type"
          className={cn(LEAVE_DIALOG_SELECT)}
          value={form.leaveTypeId}
          onChange={(event) => {
            clear()
            onFormChange({ leaveTypeId: event.target.value })
          }}
        >
          <option value="">Select leave type…</option>
          {leaveTypeInactive && selectedLeaveType ? (
            <option value={selectedLeaveType.id} disabled>
              {selectedLeaveType.code} · {selectedLeaveType.name} (inactive)
            </option>
          ) : null}
          {activeLeaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.code} · {type.name}
            </option>
          ))}
        </select>
        {activeLeaveTypes.length === 0 ? (
          <p className="mt-1 text-xs text-hrms-danger">No active leave types. Activate a type on this page first.</p>
        ) : null}
        {leaveTypeInactive && selectedLeaveType ? (
          <p className="mt-1 text-xs text-amber-900">{workflowLeaveTypeInactiveMessage(selectedLeaveType)}</p>
        ) : (
          <p className="mt-1 text-xs text-hrms-text-muted">Only active leave types can be saved to the server.</p>
        )}
      </LeaveDialogField>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-hrms-border px-3 py-2">
        <span className="text-sm text-hrms-text-secondary">Active</span>
        <Switch checked={form.isActive} onCheckedChange={(checked) => onFormChange({ isActive: checked })} />
      </div>
    </>
  )
}