export type AdminRequestIssue = 'employee_id' | 'password' | 'other'

export type AdminRequestStatus = 'open' | 'replied' | 'closed'

export type AdminSupportReply = {
  id: string
  message: string
  sentAt: string
  sentBy: string
}

export type AdminSupportRequest = {
  id: string
  email: string
  employeeId?: string
  issues: AdminRequestIssue[]
  otherDetail?: string
  note?: string
  status: AdminRequestStatus
  createdAt: string
  replies: AdminSupportReply[]
}

export type CreateAdminSupportRequestInput = {
  email: string
  employeeId?: string
  issues: AdminRequestIssue[]
  otherDetail?: string
  note?: string
}