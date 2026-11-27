/**
 * Candidate types aligned with production OpenAPI
 * (`/api/v1/recruitment/candidates`, resume upload/parse, status).
 */

export type CandidateSource =
  | 'CAREER_PAGE'
  | 'REFERRAL'
  | 'LINKEDIN'
  | 'JOB_PORTAL'
  | 'AGENCY'
  | 'WALK_IN'
  | 'OTHER'

export type CandidateSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'fullName'
  | 'experienceYears'

export type CandidateSortOrder = 'asc' | 'desc'

export type BackendCandidateResume = {
  id: string | null
  fileName: string | null
  mimeType: string | null
  sizeBytes: number | null
  uploadedAt: string | null
  version: number | null
  url: string | null
}

export type BackendCandidate = {
  id: string
  fullName: string
  email: string
  phone: string
  location: string | null
  experienceYears: number | null
  currentCompany: string | null
  currentDesignation: string | null
  skills: string[]
  source: CandidateSource
  isActive: boolean
  resumes: BackendCandidateResume[]
  createdAt: string | null
  updatedAt: string | null
}

export type CandidatesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type CandidatesPage = {
  items: BackendCandidate[]
  pagination: CandidatesPagination
}

export type ListCandidatesArgs = {
  page?: number
  limit?: number
  search?: string
  source?: CandidateSource
  isActive?: boolean
  skill?: string
  sortBy?: CandidateSortBy
  sortOrder?: CandidateSortOrder
}

export type SearchCandidatesArgs = {
  q: string
  page?: number
  limit?: number
  source?: CandidateSource
  isActive?: boolean
}

export type CreateCandidateBody = {
  fullName: string
  email: string
  phone: string
  location?: string
  experienceYears?: number
  currentCompany?: string
  currentDesignation?: string
  skills?: string[]
  source?: CandidateSource
}

export type UpdateCandidateBody = {
  fullName?: string
  email?: string
  phone?: string
  location?: string
  experienceYears?: number
  currentCompany?: string
  currentDesignation?: string
  skills?: string[]
  source?: CandidateSource
  isActive?: boolean
}

/** Resume parse review payload — fields are optional and not auto-applied. */
export type ResumeParseResult = {
  fullName: string | null
  email: string | null
  phone: string | null
  location: string | null
  experienceYears: number | null
  currentCompany: string | null
  currentDesignation: string | null
  skills: string[]
  education: string[]
  previousCompanies: string[]
  rawTextPreview: string | null
}

export type CandidateStatusHistoryEntry = {
  id: string | null
  applicationId: string | null
  jobPostingId: string | null
  jobTitle: string | null
  status: string | null
  previousStatus: string | null
  note: string | null
  changedAt: string | null
}

export type CandidateStatusTimeline = {
  candidateId: string
  entries: CandidateStatusHistoryEntry[]
}
