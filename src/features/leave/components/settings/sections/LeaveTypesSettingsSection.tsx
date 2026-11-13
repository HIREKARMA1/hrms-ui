/**
 * Simplified leave types table with plain-language "How it works" column.
 */

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import type { LeaveSettings, LeaveTypePolicy } from '../../../types/leaveSettings'
import { buildLeaveHowItWorksSentence } from '../../../utils/buildLeaveHowItWorksSentence'
import { buildApprovalReadableLine } from '../../../utils/buildApprovalReadableLine'
import { isLeaveTypeEdited } from '../../../utils/isLeaveTypeEdited'
import { ApprovalFlowChips } from '../shared/ApprovalFlowChips'
import { EditLeaveTypeDialog } from '../editLeaveType/EditLeaveTypeDialog'
import { LEAVE_MOTION, LEAVE_TABLE_THEAD } from '../../shared/leaveUi'

type LeaveTypesSettingsSectionProps = {
  draft: LeaveSettings
  saved: LeaveSettings
  onChange: (next: LeaveSettings) => void
  onApplied: () => void
}

export function LeaveTypesSettingsSection({ draft, saved, onChange, onApplied }: LeaveTypesSettingsSectionProps) {
  const [editing, setEditing] = useState<LeaveTypePolicy | null>(null)

  function updateType(next: LeaveTypePolicy) {
    onChange({
      ...draft,
      leaveTypes: draft.leaveTypes.map((item) => (item.code === next.code ? next : item)),
    })
    onApplied()
  }

  return (
    <>
      <div className="-mx-1 overflow-x-auto">
        <table className="min-w-[40rem] w-full text-left text-sm">
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              {['Leave type', 'How it works', 'Approval', 'Active', ''].map((head) => (
                <th key={head} className="px-2 py-2 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.leaveTypes.map((policy) => (
              <TypeRow
                key={policy.code}
                policy={policy}
                edited={isLeaveTypeEdited(draft, saved, policy.code)}
                onEdit={() => setEditing(policy)}
                onToggle={(enabled) =>
                  onChange({
                    ...draft,
                    leaveTypes: draft.leaveTypes.map((item) => (item.code === policy.code ? { ...item, enabled } : item)),
                  })
                }
              />
            ))}
          </tbody>
        </table>
      </div>
      <EditLeaveTypeDialog open={editing != null} policy={editing} onOpenChange={(open) => !open && setEditing(null)} onApply={updateType} />
    </>
  )
}

function TypeRow({
  policy,
  edited,
  onEdit,
  onToggle,
}: {
  policy: LeaveTypePolicy
  edited: boolean
  onEdit: () => void
  onToggle: (enabled: boolean) => void
}) {
  const approvalNote = buildApprovalReadableLine(policy)
  return (
    <tr
      onClick={onEdit}
      onKeyDown={(event) => event.key === 'Enter' && onEdit()}
      tabIndex={0}
      className={cn('border-t border-hrms-border/60', LEAVE_MOTION, 'hover:bg-hrms-row-hover', !policy.enabled && 'opacity-50')}
    >
      <td className="px-2 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-hrms-navy">{policy.label}</span>
          <Tooltip>
            <TooltipTrigger type="button" className="rounded-md bg-hrms-muted-bg px-2 py-0.5 text-xs font-medium" onClick={(e) => e.stopPropagation()}>
              {policy.code}
            </TooltipTrigger>
            <TooltipContent>Internal code used in reports.</TooltipContent>
          </Tooltip>
          {edited ? <span className="rounded-full bg-hrms-warning/15 px-2 py-0.5 text-xs font-medium text-hrms-warning">Edited</span> : null}
          <span className={cn('rounded-full px-2 py-0.5 text-xs', policy.paid ? 'bg-hrms-success/10 text-hrms-success' : 'bg-hrms-muted-bg text-hrms-text-secondary')}>
            {policy.paid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </td>
      <td className="px-2 py-2 text-sm text-hrms-text-secondary">{buildLeaveHowItWorksSentence(policy)}</td>
      <td className="px-2 py-2">
        <ApprovalFlowChips policy={policy} />
        {approvalNote ? <p className="mt-1 text-xs text-hrms-text-secondary">{approvalNote}</p> : null}
      </td>
      <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
        <Switch checked={policy.enabled} onCheckedChange={onToggle} aria-label={`${policy.label} active`} />
      </td>
      <td className="px-2 py-2">
        <button type="button" className="text-sm font-medium text-hrms-primary hover:underline" onClick={onEdit}>
          Edit
        </button>
      </td>
    </tr>
  )
}
