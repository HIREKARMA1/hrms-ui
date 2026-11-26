/**
 * Lead API contracts aligned with hrms-server
 * (`src/leads/dto/lead.schema.ts`, leads.mapper.ts, leads.controller.ts).
 */

export type BackendLeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'

export type BackendLeadPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type BackendLeadUserBrief = {
  id: string
  email: string
}

export type BackendLeadEmployeeBrief = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
}

export type BackendLeadSourceBrief = {
  id: string
  code: string
  name: string
  isActive: boolean
}

export type BackendLeadCategoryBrief = {
  id: string
  code: string
  name: string
  isActive: boolean
}

export type BackendLeadNote = {
  id: string
  body: string
  createdAt: string
  createdByUser: BackendLeadUserBrief
}

export type BackendLead = {
  id: string
  fullName: string
  email: string
  phone: string
  companyName: string | null
  status: BackendLeadStatus
  priority: BackendLeadPriority
  estimatedValue: string | null
  attachmentUrl: string | null
  source: BackendLeadSourceBrief
  category: BackendLeadCategoryBrief | null
  assignedEmployee: BackendLeadEmployeeBrief | null
  assignedByEmployee?: BackendLeadEmployeeBrief | null
  assignedByUser?: BackendLeadUserBrief | null
  createdByEmployee: BackendLeadEmployeeBrief | null
  createdByUser: BackendLeadUserBrief
  notes?: BackendLeadNote[]
  createdAt: string
  updatedAt: string
}

export type LeadsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type LeadsPage = {
  items: BackendLead[]
  pagination: LeadsPagination
}

export type ListLeadsArgs = {
  page?: number
  limit?: number
  status?: BackendLeadStatus
  priority?: BackendLeadPriority
  sourceId?: string
  categoryId?: string
  assignedEmployeeId?: string
  search?: string
}

/** POST /leads */
export type CreateLeadBody = {
  /** Optional on create; server defaults when omitted. */
  fullName?: string
  email: string
  phone: string
  companyName?: string
  sourceId: string
  categoryId?: string
  priority?: BackendLeadPriority
  estimatedValue?: number
  attachmentUrl?: string
  remarks?: string
}

/** PATCH /leads/:id — contact/value fields only */
export type UpdateLeadBody = {
  fullName?: string
  email?: string
  phone?: string
  companyName?: string | null
  sourceId?: string
  categoryId?: string | null
  estimatedValue?: number | null
  attachmentUrl?: string | null
}

/** PATCH /leads/:id/assign */
export type AssignLeadBody = {
  employeeId: string
}

/** PATCH /leads/:id/status */
export type UpdateLeadStatusBody = {
  status: BackendLeadStatus
}

/** PATCH /leads/:id/priority */
export type UpdateLeadPriorityBody = {
  priority: BackendLeadPriority
}

/** POST /leads/:id/notes */
export type AddLeadNoteBody = {
  body: string
}

/** POST /leads/duplicate-check */
export type DuplicateCheckBody = {
  email?: string
  phone?: string
}

export type DuplicateCheckMatch = {
  id: string
  fullName: string
  email: string
  phone: string
  status: BackendLeadStatus
}

export type DuplicateCheckResult = {
  matches: DuplicateCheckMatch[]
}

/** GET /leads/analytics */
export type LeadAnalyticsArgs = {
  fromDate?: string
  toDate?: string
}

export type LeadAnalyticsResult = {
  total: number
  wonCount: number
  lostCount: number
  byStatus: Array<{ status: BackendLeadStatus; count: number }>
  byPriority: Array<{ priority: BackendLeadPriority; count: number }>
}

export type {
  BackendLeadSource,
  LeadSourcesPage,
  ListLeadSourcesArgs as LeadTaxonomyListArgs,
} from './leadSourcesApi.types'

export type {
  BackendLeadCategory,
  LeadCategoriesPage,
} from './leadCategoriesApi.types'
