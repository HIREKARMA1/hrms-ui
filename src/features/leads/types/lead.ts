/**
 * Lead management domain types for CRM lifecycle UI.
 * Backend enums live in `api/leadsApi.types.ts`; UI uses display labels.
 */

export type LeadPriority = 'High' | 'Medium' | 'Low'

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost'

export type LeadNote = {
  id: string
  text: string
  authorName: string
  createdAt: string
}

export type LeadActivityType =
  | 'created'
  | 'updated'
  | 'status'
  | 'assignment'
  | 'note'
  | 'attachment'
  | 'comment'

export type LeadActivity = {
  id: string
  type: LeadActivityType
  summary: string
  createdAt: string
  createdBy: string
}

export type LeadAttachment = {
  id: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
}

export type Lead = {
  id: string
  leadName: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  industry: string
  companySize: string
  /** Display name from taxonomy. */
  source: string
  sourceId: string
  /** Display name from taxonomy. */
  category: string
  categoryId: string | null
  priority: LeadPriority
  status: LeadStatus
  estimatedValue: string | null
  attachmentUrl: string | null
  assignedEmployeeId: string | null
  assignedEmployeeName: string | null
  /** Who performed the last assignment (or creator on auto-assign). */
  assignedByEmployeeId: string | null
  assignedByEmployeeName: string | null
  createdByEmployeeId: string | null
  createdByEmployeeName: string | null
  description: string
  requirements: string
  notes: LeadNote[]
  activities: LeadActivity[]
  attachments: LeadAttachment[]
  createdAt: string
  updatedAt: string
}

export type LeadInput = Omit<
  Lead,
  'id' | 'notes' | 'activities' | 'attachments' | 'createdAt' | 'updatedAt'
>

export type LeadDuplicateMatch = {
  lead: Lead
  reasons: string[]
}