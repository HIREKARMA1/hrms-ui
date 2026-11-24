/**
 * Job posting types aligned with production OpenAPI
 * (`/api/v1/recruitment/jobs` request DTOs + documented list/detail behaviour).
 * Response field names beyond the DTOs are normalized defensively.
 */

export type JobEmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY'

export type JobWorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID'

export type JobPostingStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED'

export type JobSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'applicationDeadline'
  | 'status'
  | 'openings'

export type JobSortOrder = 'asc' | 'desc'

export type BackendJobDepartment = {
  id: string
  name: string
}

export type BackendJobHistoryEntry = {
  id?: string
  action?: string
  createdAt?: string
  note?: string | null
}

/** Public job posting payload used by list/detail/mutations. */
export type BackendJob = {
  id: string
  title: string
  departmentId: string | null
  department: BackendJobDepartment | null
  employmentType: JobEmploymentType
  location: string
  workMode: JobWorkMode
  openings: number
  minExperienceYears: number | null
  maxExperienceYears: number | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  description: string
  requirements: string | null
  skills: string[]
  applicationDeadline: string | null
  status: JobPostingStatus
  isActive: boolean
  applicationCount: number
  createdAt: string | null
  updatedAt: string | null
  history: BackendJobHistoryEntry[]
}

export type JobsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type JobsPage = {
  items: BackendJob[]
  pagination: JobsPagination
}

export type ListJobsArgs = {
  page?: number
  limit?: number
  search?: string
  status?: JobPostingStatus
  departmentId?: string
  employmentType?: JobEmploymentType
  workMode?: JobWorkMode
  isActive?: boolean
  sortBy?: JobSortBy
  sortOrder?: JobSortOrder
}

/** POST /recruitment/jobs */
export type CreateJobBody = {
  title: string
  employmentType: JobEmploymentType
  location: string
  workMode: JobWorkMode
  description: string
  departmentId?: string
  openings?: number
  minExperienceYears?: number
  maxExperienceYears?: number
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  requirements?: string
  skills?: string[]
  applicationDeadline?: string
  status?: JobPostingStatus
}

/** PATCH /recruitment/jobs/:id — description is excluded (use description endpoint). */
export type UpdateJobBody = {
  title?: string
  departmentId?: string | null
  employmentType?: JobEmploymentType
  location?: string
  workMode?: JobWorkMode
  openings?: number
  minExperienceYears?: number | null
  maxExperienceYears?: number | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string
  requirements?: string | null
  skills?: string[]
  applicationDeadline?: string | null
  status?: JobPostingStatus
}

/** PATCH /recruitment/jobs/:id/description */
export type UpdateJobDescriptionBody = {
  description: string
}
