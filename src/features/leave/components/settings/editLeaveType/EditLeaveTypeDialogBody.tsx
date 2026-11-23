/**
 * Two-column body for the guided leave type edit dialog.
 */

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import { resolveEarningModel, applyEarningModelToPolicy } from '../../../utils/leaveEarningModel'
import type { LeaveEarningModel } from '../../../types/leaveEarningModel'
import { EarningModelPicker } from './EarningModelPicker'
import { EditLeaveTypeBasics } from './EditLeaveTypeBasics'
import { EditLeaveTypeApproval } from './EditLeaveTypeApproval'
import { EditLeaveTypeMoreRules } from './EditLeaveTypeMoreRules'
import { EditLeaveTypePreview } from './EditLeaveTypePreview'

type EditLeaveTypeDialogBodyProps = {
  draft: LeaveTypePolicy
  onChange: (next: LeaveTypePolicy) => void
}

export function EditLeaveTypeDialogBody({ draft, onChange }: EditLeaveTypeDialogBodyProps) {
  const model = resolveEarningModel(draft)

  function pickModel(nextModel: LeaveEarningModel) {
    onChange(applyEarningModelToPolicy(draft, nextModel))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <EarningModelPicker value={model} onChange={pickModel} />
        <EditLeaveTypeBasics value={draft} onChange={onChange} />
        <EditLeaveTypeApproval value={draft} onChange={onChange} />
        <EditLeaveTypeMoreRules value={draft} onChange={onChange} />
      </div>
      <EditLeaveTypePreview policy={draft} />
    </div>
  )
}
