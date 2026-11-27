/** Row from `GET /leave-approval/workflows` (listWorkflows). */
export type WorkflowAssigneeType = 'EXPLICIT_EMPLOYEES' | 'DEPARTMENT' | 'ANY_PROCESSOR'

export type ApiApprovalWorkflowStep = {
  id?: string
  order?: number
  sequence?: number
  stepOrder?: number
  levelNumber?: number
  level?: string
  role?: string
  approverRole?: string
  approverType?: string
  assigneeType?: WorkflowAssigneeType | string
  assigneeEmployeeIds?: string[]
  employeeIds?: string[]
  departmentId?: string
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
  leaveTypeIds?: string[]
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
  approverRole?: string
  assigneeType?: WorkflowAssigneeType
  employeeIds?: string[]
  departmentId?: string
}

export type ApprovalWorkflowDetailView = ApprovalWorkflowTableRow & {
  description?: string
  leaveTypeId?: string
  leaveTypeIds?: string[]
  steps: ApprovalWorkflowStepView[]
}

/** POST /leave-approval/workflows level row. */
export type ApprovalWorkflowLevelBody = {
  levelNumber: number
  assigneeType: WorkflowAssigneeType
  assigneeEmployeeIds?: string[]
  departmentId?: string
}

export type CreateApprovalWorkflowBody = {
  name: string
  description?: string
  leaveTypeIds: string[]
  isActive?: boolean
  levels: ApprovalWorkflowLevelBody[]
}

export type UpdateApprovalWorkflowBody = Partial<CreateApprovalWorkflowBody>
