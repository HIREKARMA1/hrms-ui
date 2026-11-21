/** Row from `GET /leave-approval/workflows` (listWorkflows). */
export type ApiApprovalWorkflowStep = {
  id?: string
  order?: number
  sequence?: number
  stepOrder?: number
  level?: string
  role?: string
  approverRole?: string
  approverType?: string
  name?: string
  label?: string
}

export type ApiApprovalWorkflowItem = {
  id: string
  name?: string
  title?: string
  code?: string
  description?: string
  leaveTypeId?: string
  leaveTypeCode?: string
  leaveType?: {
    id?: string
    code?: string
    name?: string
  }
  steps?: ApiApprovalWorkflowStep[]
  workflowSteps?: ApiApprovalWorkflowStep[]
  levels?: ApiApprovalWorkflowStep[]
  enabled?: boolean
  isActive?: boolean
  default?: boolean
}

export type ApprovalWorkflowsListData = {
  items: ApiApprovalWorkflowItem[]
}

export type ApprovalWorkflowTableRow = {
  id: string
  name: string
  leaveTypeCode: string
  stepsSummary: string
  active: boolean
}

export type ApprovalWorkflowStepView = {
  order: number
  label: string
}

export type ApprovalWorkflowDetailView = ApprovalWorkflowTableRow & {
  description?: string
  steps: ApprovalWorkflowStepView[]
}
