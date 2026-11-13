/**
 * Approval controls and live step diagram in the leave type editor.
 */

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import { SettingsField } from '../shared/SettingsField'
import { SettingsSegmented } from '../shared/SettingsSegmented'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'
import { ApprovalStepDiagram } from './ApprovalStepDiagram'

type EditLeaveTypeApprovalProps = {
  value: LeaveTypePolicy
  onChange: (next: LeaveTypePolicy) => void
}

export function EditLeaveTypeApproval({ value, onChange }: EditLeaveTypeApprovalProps) {
  const set = (patch: Partial<LeaveTypePolicy>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-hrms-text-secondary">Approval</p>
      <SettingsSegmented
        ariaLabel="Approval"
        value={value.approvalChain}
        onChange={(approvalChain) =>
          set({
            approvalChain: approvalChain as LeaveTypePolicy['approvalChain'],
            managerOnlyUpToDays: approvalChain === 'manager_hr' ? value.managerOnlyUpToDays : null,
          })
        }
        options={[
          { value: 'manager', label: 'Manager only' },
          { value: 'manager_hr', label: 'Manager then HR' },
          { value: 'hr', label: 'HR only' },
        ]}
      />
      {value.approvalChain === 'manager_hr' ? (
        <SettingsField label="Manager approves alone up to" helper="Longer requests also need HR approval.">
          <SettingsNumberInput value={value.managerOnlyUpToDays ?? 0} onChange={(n) => set({ managerOnlyUpToDays: n || null })} unit="days" min={0} />
        </SettingsField>
      ) : null}
      <ApprovalStepDiagram policy={value} />
    </div>
  )
}
