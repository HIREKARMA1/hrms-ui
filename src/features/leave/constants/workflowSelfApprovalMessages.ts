export const WORKFLOW_SELF_APPROVAL_FORM_HINT =
  'Employees cannot approve their own leave. For Level 1, use the applicant’s reporting manager or another approver—not the employee who applies.'

export const WORKFLOW_SELF_APPROVAL_EXPLICIT_LEVEL_HINT =
  'Named employees at this level cannot approve leave they applied for themselves. Pick a manager or HR contact instead.'

export function workflowSelfApprovalRequestMessage(applicantName: string): string {
  return `${applicantName} applied for this leave, but the current workflow step also names them as approver. They cannot approve their own request. Edit the workflow (use a manager at Level 1) or cancel this request and apply again.`
}