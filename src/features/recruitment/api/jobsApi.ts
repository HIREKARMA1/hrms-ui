/**
 * RTK Query client for production recruitment job postings
 * (`/recruitment/jobs` + description endpoint).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import type {
  BackendJob,
  BackendJobDepartment,
  BackendJobHistoryEntry,
  CreateJobBody,
  JobEmploymentType,
  JobPostingStatus,
  JobWorkMode,
  JobsPage,
  JobsPagination,
  ListJobsArgs,
  UpdateJobBody,
  UpdateJobDescriptionBody,
} from './jobsApi.types'

export const JOBS_PAGE_SIZE = 20
export const JOBS_MAX_LIMIT = 100

const LIST_TAG = { type: 'RecruitmentJob' as const, id: 'LIST' }

const EMPLOYMENT_TYPES = new Set<JobEmploymentType>([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
])
const WORK_MODES = new Set<JobWorkMode>(['ONSITE', 'REMOTE', 'HYBRID'])
const STATUSES = new Set<JobPostingStatus>([
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'CANCELLED',
])

function clampLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? JOBS_PAGE_SIZE), 1), JOBS_MAX_LIMIT)
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListJobsArgs) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 200)
  if (args.status) params.status = args.status
  if (args.departmentId?.trim()) params.departmentId = args.departmentId.trim()
  if (args.employmentType) params.employmentType = args.employmentType
  if (args.workMode) params.workMode = args.workMode
  if (args.isActive !== undefined) params.isActive = args.isActive
  if (args.sortBy) params.sortBy = args.sortBy
  if (args.sortOrder) params.sortOrder = args.sortOrder
  return params
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

/**
 * Accepts JSON numbers and Prisma Decimal string forms from the jobs API
 * (e.g. minExperienceYears / salaryMin returned as `"3"` / `"800000"`).
 */
function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const num = Number(trimmed)
    return Number.isFinite(num) ? num : null
  }
  return null
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeDepartment(raw: unknown, fallbackId: string | null): BackendJobDepartment | null {
  const row = asRecord(raw)
  if (!row) return null
  const id = readString(row.id) ?? fallbackId
  const name = readString(row.name)
  if (!id || !name) return null
  return { id, name }
}

function normalizeHistory(raw: unknown): BackendJobHistoryEntry[] {
  if (!Array.isArray(raw)) return []
  const items: BackendJobHistoryEntry[] = []
  for (const entry of raw) {
    const row = asRecord(entry)
    if (!row) continue
    items.push({
      id: readString(row.id) ?? undefined,
      action: readString(row.action) ?? readString(row.type) ?? undefined,
      createdAt: readString(row.createdAt) ?? undefined,
      note: row.note === null ? null : readString(row.note),
    })
  }
  return items
}

function normalizeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 50)
}

export function normalizeJob(raw: unknown): BackendJob | null {
  const row = asRecord(raw)
  if (!row) return null

  const id = readString(row.id)
  const title = readString(row.title)
  const location = readString(row.location)
  const description = readString(row.description)
  const employmentType = readString(row.employmentType)
  const workMode = readString(row.workMode)
  const status = readString(row.status)

  if (
    !id ||
    !title ||
    !location ||
    !description ||
    !employmentType ||
    !EMPLOYMENT_TYPES.has(employmentType as JobEmploymentType) ||
    !workMode ||
    !WORK_MODES.has(workMode as JobWorkMode) ||
    !status ||
    !STATUSES.has(status as JobPostingStatus)
  ) {
    return null
  }

  const departmentId =
    row.departmentId === null || row.departmentId === undefined
      ? null
      : readString(row.departmentId)

  const applicationCount =
    readNumber(row.applicationCount) ??
    readNumber(row.applicantsCount) ??
    readNumber(row.applicants) ??
    0

  return {
    id,
    title,
    departmentId,
    department: normalizeDepartment(row.department, departmentId),
    employmentType: employmentType as JobEmploymentType,
    location,
    workMode: workMode as JobWorkMode,
    openings: readNumber(row.openings) ?? 1,
    minExperienceYears:
      row.minExperienceYears === null || row.minExperienceYears === undefined
        ? null
        : readNumber(row.minExperienceYears),
    maxExperienceYears:
      row.maxExperienceYears === null || row.maxExperienceYears === undefined
        ? null
        : readNumber(row.maxExperienceYears),
    salaryMin:
      row.salaryMin === null || row.salaryMin === undefined
        ? null
        : readNumber(row.salaryMin),
    salaryMax:
      row.salaryMax === null || row.salaryMax === undefined
        ? null
        : readNumber(row.salaryMax),
    salaryCurrency:
      row.salaryCurrency === null || row.salaryCurrency === undefined
        ? null
        : readString(row.salaryCurrency),
    description,
    requirements:
      row.requirements === null || row.requirements === undefined
        ? null
        : readString(row.requirements),
    skills: normalizeSkills(row.skills),
    applicationDeadline:
      row.applicationDeadline === null || row.applicationDeadline === undefined
        ? null
        : readString(row.applicationDeadline),
    referenceName:
      row.referenceName === null || row.referenceName === undefined
        ? null
        : readString(row.referenceName),
    referenceEmail:
      row.referenceEmail === null || row.referenceEmail === undefined
        ? null
        : readString(row.referenceEmail),
    status: status as JobPostingStatus,
    isActive: readBoolean(row.isActive, true),
    applicationCount,
    createdAt: readString(row.createdAt),
    updatedAt: readString(row.updatedAt),
    history: normalizeHistory(row.history ?? row.recentHistory),
  }
}

function normalizePagination(raw: unknown, itemCount: number): JobsPagination {
  const row = asRecord(raw)
  const page = readNumber(row?.page) || 1
  const limit = readNumber(row?.limit) || JOBS_PAGE_SIZE
  const total = row?.total !== undefined ? readNumber(row.total) ?? itemCount : itemCount
  const totalPages =
    row?.totalPages !== undefined
      ? readNumber(row.totalPages) ?? 0
      : total === 0
        ? 0
        : Math.ceil(total / limit)
  return { page, limit, total, totalPages }
}

export function normalizeJobsPage(raw: unknown): JobsPage {
  const root = asRecord(raw)
  const data = asRecord(root?.data) ?? root
  const itemsRaw = data?.items
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((item) => normalizeJob(item)).filter((item): item is BackendJob => item !== null)
    : []
  return {
    items,
    pagination: normalizePagination(data?.pagination, items.length),
  }
}

export function normalizeJobEnvelope(raw: unknown): BackendJob {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const job = normalizeJob(data)
  if (!job) throw new Error('Invalid job response from server.')
  return job
}

function pageTags(page: JobsPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'RecruitmentJob' as const, id: item.id })),
  ]
}

export function getJobErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /recruitment/jobs */
    listJobs: build.query<JobsPage, ListJobsArgs | void>({
      query: (args = {}) => ({
        url: '/recruitment/jobs',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizeJobsPage(response),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /recruitment/jobs/:id */
    getJob: build.query<BackendJob, string>({
      query: (id) => `/recruitment/jobs/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeJobEnvelope(response),
      providesTags: (_result, _error, id) => [{ type: 'RecruitmentJob', id }],
    }),

    /** POST /recruitment/jobs */
    createJob: build.mutation<BackendJob, CreateJobBody>({
      query: (body) => ({
        url: '/recruitment/jobs',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeJobEnvelope(response),
      invalidatesTags: [LIST_TAG],
    }),

    /** PATCH /recruitment/jobs/:id (description excluded). */
    updateJob: build.mutation<BackendJob, { id: string; body: UpdateJobBody }>({
      query: ({ id, body }) => ({
        url: `/recruitment/jobs/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeJobEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentJob', id },
        LIST_TAG,
      ],
    }),

    /**
     * DELETE /recruitment/jobs/:id — soft-deactivates (`isActive=false`).
     * Hard delete is never performed when applications exist.
     */
    deleteJob: build.mutation<BackendJob | null, string>({
      query: (id) => ({
        url: `/recruitment/jobs/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: unknown) => {
        const root = asRecord(response)
        if (root?.data === null || root?.data === undefined) return null
        return normalizeJob(root.data) ?? null
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'RecruitmentJob', id },
        LIST_TAG,
      ],
    }),

    /** PATCH /recruitment/jobs/:id/description */
    updateJobDescription: build.mutation<
      BackendJob,
      { id: string; body: UpdateJobDescriptionBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/jobs/${encodeURIComponent(id)}/description`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeJobEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentJob', id },
        LIST_TAG,
      ],
    }),
  }),
})

export const {
  useListJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useUpdateJobDescriptionMutation,
} = jobsApi
