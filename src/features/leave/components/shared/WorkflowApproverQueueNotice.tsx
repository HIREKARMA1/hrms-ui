import { WORKFLOW_QUEUE_NO_EMPLOYEE_LINK_MESSAGE } from '../../constants/workflowApproverQueueMessages'

export function WorkflowApproverQueueNotice() {
  return (
    <div
      role="status"
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
    >
      {WORKFLOW_QUEUE_NO_EMPLOYEE_LINK_MESSAGE}
    </div>
  )
}