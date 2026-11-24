/**
 * RTK Query client for production recruitment applications.
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  APPLICATION_STATUSES,
  type ApplicationSortOrder,
  type ApplicationSource,
  type ApplicationStatus,
  type ApplicationsPage,
  type ApplicationsPagination,
  type BackendApplication,
  type BackendApplicationCandidate,
  type BackendApplicationJob,
  type CreateApplicationBody,
  type ListApplicationsArgs,
  type UpdateApplicationStatusBody,
} from './applicationsApi.types'

export const APPLICATIONS_PAGE_SIZE = 20
export const APPLICATIONS_MAX_LIMIT = 100

const LIST_TAG = { type: 'RecruitmentApplication' as const, id: 'LIST' }
const STATUS_SET = new Set<string>(APPLICATION_STATUSES)
const SOURCE_SET = new Set<ApplicationSource>([
  'CAREER_PAGE',
  'REFERRAL',
  'LINKEDIN',
  'JOB_PORTAL',
  'AGENCY',
  'WALK_IN',
  'OTHER',
])

function clampLimit(limit: number | undefined) {
  return Math.min(
    Math.max(Math.trunc(limit ?? APPLICATIONS_PAGE_SIZE), 1),
    APPLICATIONS_MAX_LIMIT,
  )
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeStatus(value: unknown): ApplicationStatus {
  const raw = readString(value)?.toUpperCase()
  return raw && STATUS_SET.has(raw) ? (raw as ApplicationStatus) : 'APPLIED'
}

function normalizeSource(value: unknown): ApplicationSource {
  const raw = readString(value)?.toUpperCase()
  return raw && SOURCE_SET.has(raw as ApplicationSource)
    ? (raw as ApplicationSource)
    : 'OTHER'
}

function normalizeCandidate(
  raw: unknown,
  fallbackId: string,
): BackendApplicationCandidate | null {
  const row = asRecord(raw)
  if (!row) {
    return fallbackId
      ? { id: fallbackId, fullName: null, email: null }
      : null
  }
  const id = readString(row.id) ?? fallbackId
  if (!id) return null
  return {
    id,
    fullName: readString(row.fullName),
    email: readString(row.email),
  }
}

function normalizeJob(
  raw: unknown,
  fallbackId: string,
): BackendApplicationJob | null {
  const row = asRecord(raw)
  if (!row) {
    return fallbackId ? { id: fallbackId, title: null } : null
  }
  const id = readString(row.id) ?? fallbackId
  if (!id) return null
  return {
    id,
    title: readString(row.title),
  }
}

export function normalizeApplication(raw: unknown): BackendApplication | null {
  const row = asRecord(raw)
  if (!row) return null
  const id = readString(row.id)
  const jobPostingId =
    readString(row.jobPostingId) ?? readString(asRecord(row.jobPosting)?.id)
  const candidateId =
    readString(row.candidateId) ?? readString(asRecord(row.candidate)?.id)
  if (!id || !jobPostingId || !candidateId) return null

  return {
    id,
    jobPostingId,
    candidateId,
    status: normalizeStatus(row.status),
    source: normalizeSource(row.source),
    coverLetter: readString(row.coverLetter),
    appliedAt: readString(row.appliedAt),
    createdAt: readString(row.createdAt),
    updatedAt: readString(row.updatedAt),
    candidate: normalizeCandidate(row.candidate, candidateId),
    jobPosting: normalizeJob(row.jobPosting ?? row.job, jobPostingId),
  }
}

function normalizePagination(raw: unknown, itemCount: number): ApplicationsPagination {
  const row = asRecord(raw)
  const page = Math.max(1, Math.trunc(readNumber(row?.page) ?? 1))
  const limit = Math.max(
    1,
    Math.trunc(readNumber(row?.limit) ?? APPLICATIONS_PAGE_SIZE),
  )
  const total = Math.max(0, Math.trunc(readNumber(row?.total) ?? itemCount))
  const totalPages =
    Math.max(
      0,
      Math.trunc(readNumber(row?.totalPages) ?? Math.ceil(total / limit)),
    ) || (total === 0 ? 0 : 1)
  return { page, limit, total, totalPages }
}

export function normalizeApplicationsPage(raw: unknown): ApplicationsPage {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const payload = asRecord(data)
  const itemsRaw = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(data)
      ? data
      : []
  const items = itemsRaw
    .map(normalizeApplication)
    .filter((item): item is BackendApplication => item !== null)
  return {
    items,
    pagination: normalizePagination(payload?.pagination, items.length),
  }
}

export function normalizeApplicationEnvelope(raw: unknown): BackendApplication {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const application = normalizeApplication(data)
  if (!application) throw new Error('Invalid application response from server.')
  return application
}

function listParams(args: ListApplicationsArgs) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  if (args.jobPostingId?.trim()) params.jobPostingId = args.jobPostingId.trim()
  if (args.candidateId?.trim()) params.candidateId = args.candidateId.trim()
  if (args.status) params.status = args.status
  if (args.departmentId?.trim()) params.departmentId = args.departmentId.trim()
  if (args.source) params.source = args.source
  if (args.fromDate?.trim()) params.fromDate = args.fromDate.trim()
  if (args.toDate?.trim()) params.toDate = args.toDate.trim()
  if (args.sortBy) params.sortBy = args.sortBy
  if (args.sortOrder) params.sortOrder = args.sortOrder as ApplicationSortOrder
  return params
}

function pageTags(page: ApplicationsPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({
      type: 'RecruitmentApplication' as const,
      id: item.id,
    })),
  ]
}

export function getApplicationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return getApiErrorMessage(error, fallback)
}

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listApplications: build.query<ApplicationsPage, ListApplicationsArgs | void>({
      query: (args = {}) => ({
        url: '/recruitment/applications',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizeApplicationsPage(response),
      providesTags: (result) => pageTags(result),
    }),

    getApplication: build.query<BackendApplication, string>({
      query: (id) => `/recruitment/applications/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        normalizeApplicationEnvelope(response),
      providesTags: (_result, _error, id) => [
        { type: 'RecruitmentApplication', id },
      ],
    }),

    createApplication: build.mutation<BackendApplication, CreateApplicationBody>({
      query: (body) => ({
        url: '/recruitment/applications',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeApplicationEnvelope(response),
      invalidatesTags: [
        LIST_TAG,
        { type: 'RecruitmentAnalytics', id: 'PIPELINE' },
        { type: 'RecruitmentAnalytics', id: 'OVERVIEW' },
      ],
    }),

    updateApplicationStatus: build.mutation<
      BackendApplication,
      { id: string; body: UpdateApplicationStatusBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/applications/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeApplicationEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentApplication', id },
        LIST_TAG,
        { type: 'RecruitmentAnalytics', id: 'PIPELINE' },
        { type: 'RecruitmentAnalytics', id: 'OVERVIEW' },
      ],
    }),
  }),
})

export const {
  useListApplicationsQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useUpdateApplicationStatusMutation,
} = applicationsApi
