/**
 * Large guided dialog to edit a leave type (Apply changes updates draft only).
 */

import { useState } from 'react'
import { FileText } from 'lucide-react'

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../../shared/LeaveDialog'
import { EditLeaveTypeDialogBody } from './EditLeaveTypeDialogBody'

type EditLeaveTypeDialogProps = {
  open: boolean
  policy: LeaveTypePolicy | null
  onOpenChange: (open: boolean) => void
  onApply: (policy: LeaveTypePolicy) => void
}

export function EditLeaveTypeDialog({ open, policy, onOpenChange, onApply }: EditLeaveTypeDialogProps) {
  if (!open || !policy) {
    return <LeaveDialogRoot open={false} onOpenChange={onOpenChange} />
  }
  return <EditLeaveTypeDialogInner policy={policy} onOpenChange={onOpenChange} onApply={onApply} />
}

function EditLeaveTypeDialogInner({
  policy,
  onOpenChange,
  onApply,
}: {
  policy: LeaveTypePolicy
  onOpenChange: (open: boolean) => void
  onApply: (policy: LeaveTypePolicy) => void
}) {
  const [draft, setDraft] = useState(() => ({ ...policy }))

  return (
    <LeaveDialogRoot open onOpenChange={onOpenChange}>
      <LeaveDialogContent size="lg">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader title={draft.label} subtitle="Change rules for this leave type." icon={FileText} />
        <LeaveDialogBody>
          <EditLeaveTypeDialogBody draft={draft} onChange={setDraft} />
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <p className="mb-3 text-xs text-hrms-text-secondary">Changes are saved when you click Save settings.</p>
          <LeaveDialogFooterActions
            primaryLabel="Apply changes"
            onPrimary={() => {
              onApply(draft)
              onOpenChange(false)
            }}
          />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}
