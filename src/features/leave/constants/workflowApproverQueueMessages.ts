/**
 * Copy when `GET /leave-approval/pending` is not called or cannot apply (no linked employee).
 * Super Admin / HR users do not need an employee record for org-wide leave review.
 */

export const WORKFLOW_QUEUE_NO_EMPLOYEE_LINK_MESSAGE =
  'This queue is only for workflow approvers whose sign-in is linked to an employee. You do not need a linked employee to administer leave — use All requests to review organisation leave. To approve workflow steps, sign in as a user with a linked employee (for example your HR approver account).'