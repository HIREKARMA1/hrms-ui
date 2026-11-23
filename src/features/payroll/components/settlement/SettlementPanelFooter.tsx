/**
 * Sticky footer actions for the settlement sheet (save, submit, workflow).
 * Used by SettlementDetailPanel.
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { FinalSettlement } from '../../types/finalSettlement'
import { PAYROLL_SECONDARY_BUTTON } from '../shared/payrollUi'
import { ApproveRowButton, RejectRowButton } from '../shared/PayrollRowActions'

type SettlementPanelFooterProps = {
  draft: FinalSettlement
  readOnly: boolean
  canSubmit: boolean
  onSave: () => void
  onSubmit: () => void
  onDiscard: () => void
  onApprove: () => void
  onReject: () => void
  onPaid: () => void
  onDownload: () => void
}

export function SettlementPanelFooter({
  draft,
  readOnly,
  canSubmit,
  onSave,
  onSubmit,
  onDiscard,
  onApprove,
  onReject,
  onPaid,
  onDownload,
}: SettlementPanelFooterProps) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <button type="button" className="text-sm font-medium text-hrms-primary hover:underline" onClick={onDownload}>
        Download settlement statement
      </button>
      <WorkflowActions
        draft={draft}
        readOnly={readOnly}
        canSubmit={canSubmit}
        onSave={onSave}
        onSubmit={onSubmit}
        onDiscard={onDiscard}
        onApprove={onApprove}
        onReject={onReject}
        onPaid={onPaid}
      />
    </div>
  )
}

function WorkflowActions(props: {
  draft: FinalSettlement
  readOnly: boolean
  canSubmit: boolean
  onSave: () => void
  onSubmit: () => void
  onDiscard: () => void
  onApprove: () => void
  onReject: () => void
  onPaid: () => void
}) {
  if (!props.readOnly) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className={cn(PAYROLL_SECONDARY_BUTTON)} onClick={props.onDiscard}>
          Cancel
        </Button>
        <Button type="button" variant="outline" className={cn(PAYROLL_SECONDARY_BUTTON)} onClick={props.onSave}>
          Save
        </Button>
        <div className="flex flex-col items-end gap-1">
          <Button type="button" disabled={!props.canSubmit} onClick={props.onSubmit}>
            Submit
          </Button>
          {!props.canSubmit ? (
            <span className="text-xs text-hrms-text-muted">Add earnings and a positive net payable to submit.</span>
          ) : null}
        </div>
      </div>
    )
  }
  if (props.draft.status === 'Pending approval') {
    return (
      <div className="flex gap-2">
        <ApproveRowButton onClick={props.onApprove} />
        <RejectRowButton onClick={props.onReject} />
      </div>
    )
  }
  if (props.draft.status === 'Approved') {
    return (
      <Button type="button" onClick={props.onPaid}>
        Mark as paid
      </Button>
    )
  }
  return null
}
