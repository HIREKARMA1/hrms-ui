/**
 * Application types aligned with production OpenAPI
 * (`/api/v1/recruitment/applications`).
 */

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'OFFER_RELEASED'
  | 'JOINED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type ApplicationSource =
  | 'CAREER_PAGE'
  | 'REFERRAL'
  | 'LINKEDIN'
  | 'JOB_PORTAL'
  | 'AGENCY'
  | 'WALK_IN'
  | 'OTHER'

export type ApplicationSortBy = 'appliedAt' | 'createdAt' | 'updatedAt' | 'status'
export type ApplicationSortOrder = 'asc' | 'desc'

export type BackendApplicationCandidate = {
  id: string
  fullName: string | null
  email: string | null
}

export type BackendApplicationJob = {
  id: string
  title: string | null
}

export type BackendApplication = {
  id: string
  jobPostingId: string
  candidateId: string
  status: ApplicationStatus
  source: ApplicationSource
  coverLetter: string | null
  appliedAt: string | null
  createdAt: string | null
  updatedAt: string | null
  candidate: BackendApplicationCandidate | null
  jobPosting: BackendApplicationJob | null
}

export type ApplicationsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApplicationsPage = {
  items: BackendApplication[]
  pagination: ApplicationsPagination
}

export type ListApplicationsArgs = {
  page?: number
  limit?: number
  jobPostingId?: string
  candidateId?: string
  status?: ApplicationStatus
  departmentId?: string
  source?: ApplicationSource
  fromDate?: string
  toDate?: string
  sortBy?: ApplicationSortBy
  sortOrder?: ApplicationSortOrder
}

export type CreateApplicationBody = {
  jobPostingId: string
  candidateId: string
  source?: ApplicationSource
  coverLetter?: string
  appliedAt?: string
}

export type UpdateApplicationStatusBody = {
  status: ApplicationStatus
  note?: string
}

export const APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'OFFER_RELEASED',
  'JOINED',
  'REJECTED',
  'WITHDRAWN',
] as const
