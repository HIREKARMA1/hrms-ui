/**
 * Escalation card plus per-type approval list for Leave Settings.
 */

import { useState } from 'react'

import type { LeaveSettings, LeaveTypePolicy } from '../../../types/leaveSettings'
import { ApprovalFlowChips } from '../shared/ApprovalFlowChips'
import { EditLeaveTypeDialog } from '../editLeaveType/EditLeaveTypeDialog'
import { SettingsField } from '../shared/SettingsField'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'
import { buildApprovalReadableLine } from '../../../utils/buildApprovalReadableLine'

type ApprovalsSettingsSectionProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
  onApplied: () => void
}

export function ApprovalsSettingsSection({ draft, onChange, onApplied }: ApprovalsSettingsSectionProps) {
  const [editing, setEditing] = useState<LeaveTypePolicy | null>(null)
  const enabled = draft.leaveTypes.filter((item) => item.enabled)

  function applyType(next: LeaveTypePolicy) {
    onChange({ ...draft, leaveTypes: draft.leaveTypes.map((item) => (item.code === next.code ? next : item)) })
    onApplied()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-hrms-border bg-hrms-muted-bg/40 p-4">
        <SettingsField label="Escalate a request that stays pending for" helper="Escalated requests are flagged and also show for HR.">
          <SettingsNumberInput
            value={draft.escalation.daysPendingBeforeEscalation}
            onChange={(daysPendingBeforeEscalation) => onChange({ ...draft, escalation: { ...draft.escalation, daysPendingBeforeEscalation } })}
            unit="days"
            min={1}
          />
        </SettingsField>
      </div>
      <ul className="divide-y divide-hrms-border/60 rounded-xl border border-hrms-border">
        {enabled.map((policy) => {
          const note = buildApprovalReadableLine(policy)
          return (
            <li key={policy.code} className="flex flex-wrap items-center justify-between gap-2 px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-hrms-navy">{policy.label}</p>
                <ApprovalFlowChips policy={policy} />
                {note ? <p className="mt-1 text-xs text-hrms-text-secondary">{note}</p> : null}
              </div>
              <button type="button" className="text-sm font-medium text-hrms-primary hover:underline" onClick={() => setEditing(policy)}>
                Edit
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-sm text-hrms-text-secondary">Approvers can set a delegate from the Approvals tab.</p>
      <EditLeaveTypeDialog open={editing != null} policy={editing} onOpenChange={(open) => !open && setEditing(null)} onApply={applyType} />
    </div>
  )
}
