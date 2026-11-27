/**
 * RTK Query client for production recruitment candidates
 * (`/recruitment/candidates`, resume upload/parse, status timeline).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import type {
  BackendCandidate,
  BackendCandidateResume,
  CandidateSource,
  CandidateStatusHistoryEntry,
  CandidateStatusTimeline,
  CandidatesPage,
  CandidatesPagination,
  CreateCandidateBody,
  ListCandidatesArgs,
  ResumeParseResult,
  SearchCandidatesArgs,
  UpdateCandidateBody,
} from './candidatesApi.types'

export const CANDIDATES_PAGE_SIZE = 20
export const CANDIDATES_MAX_LIMIT = 100

const LIST_TAG = { type: 'RecruitmentCandidate' as const, id: 'LIST' }

const SOURCES = new Set<CandidateSource>([
  'CAREER_PAGE',
  'REFERRAL',
  'LINKEDIN',
  'JOB_PORTAL',
  'AGENCY',
  'WALK_IN',
  'OTHER',
])

function clampLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? CANDIDATES_PAGE_SIZE), 1), CANDIDATES_MAX_LIMIT)
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

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeSource(value: unknown): CandidateSource {
  const raw = readString(value)?.toUpperCase()
  return raw && SOURCES.has(raw as CandidateSource)
    ? (raw as CandidateSource)
    : 'OTHER'
}

function normalizeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 50)
}

function normalizeStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function normalizeResume(raw: unknown): BackendCandidateResume | null {
  const row = asRecord(raw)
  if (!row) return null
  return {
    id: readString(row.id),
    fileName: readString(row.fileName) ?? readString(row.filename),
    mimeType: readString(row.mimeType) ?? readString(row.contentType),
    sizeBytes: readNumber(row.sizeBytes) ?? readNumber(row.size),
    uploadedAt: readString(row.uploadedAt) ?? readString(row.createdAt),
    version: readNumber(row.version),
    url: readString(row.url) ?? readString(row.fileUrl),
  }
}

export function normalizeCandidate(raw: unknown): BackendCandidate | null {
  const row = asRecord(raw)
  if (!row) return null
  const id = readString(row.id)
  const fullName = readString(row.fullName)
  const email = readString(row.email)
  // Phone is required on CreateCandidateDto, but /candidates/me responses must
  // still resolve when phone is blank so Apply Now can use the real candidateId.
  const phone = readString(row.phone) ?? ''
  if (!id || !fullName || !email) return null

  const resumesRaw = Array.isArray(row.resumes)
    ? row.resumes
    : Array.isArray(row.resumeVersions)
      ? row.resumeVersions
      : []
  const resumes = resumesRaw
    .map(normalizeResume)
    .filter((item): item is BackendCandidateResume => item !== null)

  return {
    id,
    fullName,
    email,
    phone,
    location: readString(row.location),
    experienceYears: readNumber(row.experienceYears),
    currentCompany: readString(row.currentCompany),
    currentDesignation: readString(row.currentDesignation),
    skills: normalizeSkills(row.skills),
    source: normalizeSource(row.source),
    isActive: readBoolean(row.isActive, true),
    resumes,
    createdAt: readString(row.createdAt),
    updatedAt: readString(row.updatedAt),
  }
}

function normalizePagination(raw: unknown, itemCount: number): CandidatesPagination {
  const row = asRecord(raw)
  const page = Math.max(1, Math.trunc(readNumber(row?.page) ?? 1))
  const limit = Math.max(1, Math.trunc(readNumber(row?.limit) ?? CANDIDATES_PAGE_SIZE))
  const total = Math.max(0, Math.trunc(readNumber(row?.total) ?? itemCount))
  const totalPages =
    Math.max(0, Math.trunc(readNumber(row?.totalPages) ?? Math.ceil(total / limit))) ||
    (total === 0 ? 0 : 1)
  return { page, limit, total, totalPages }
}

export function normalizeCandidatesPage(raw: unknown): CandidatesPage {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const payload = asRecord(data)
  const itemsRaw = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(data)
      ? data
      : []
  const items = itemsRaw
    .map(normalizeCandidate)
    .filter((item): item is BackendCandidate => item !== null)
  return {
    items,
    pagination: normalizePagination(payload?.pagination, items.length),
  }
}

export function normalizeCandidateEnvelope(raw: unknown): BackendCandidate {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const candidate = normalizeCandidate(data)
  if (!candidate) throw new Error('Invalid candidate response from server.')
  return candidate
}

export function normalizeResumeParseResult(raw: unknown): ResumeParseResult {
  const root = asRecord(raw)
  const data = asRecord(root?.data !== undefined ? root.data : raw) ?? {}
  return {
    fullName: readString(data.fullName),
    email: readString(data.email),
    phone: readString(data.phone),
    location: readString(data.location),
    experienceYears: readNumber(data.experienceYears),
    currentCompany: readString(data.currentCompany),
    currentDesignation: readString(data.currentDesignation),
    skills: normalizeSkills(data.skills),
    education: normalizeStringList(data.education),
    previousCompanies: normalizeStringList(
      data.previousCompanies ?? data.companies,
    ),
    rawTextPreview: readString(data.rawTextPreview) ?? readString(data.preview),
  }
}

function normalizeStatusEntry(raw: unknown): CandidateStatusHistoryEntry | null {
  const row = asRecord(raw)
  if (!row) return null
  return {
    id: readString(row.id),
    applicationId: readString(row.applicationId),
    jobPostingId: readString(row.jobPostingId),
    jobTitle: readString(row.jobTitle) ?? readString(row.jobPostingTitle),
    status: readString(row.status) ?? readString(row.newStatus),
    previousStatus: readString(row.previousStatus),
    note: readString(row.note),
    changedAt:
      readString(row.changedAt) ??
      readString(row.createdAt) ??
      readString(row.timestamp),
  }
}

export function normalizeCandidateStatusTimeline(
  raw: unknown,
  candidateId: string,
): CandidateStatusTimeline {
  const root = asRecord(raw)
  const data = root?.data !== undefined ? root.data : raw
  const payload = asRecord(data)
  const list = Array.isArray(payload?.entries)
    ? payload.entries
    : Array.isArray(payload?.history)
      ? payload.history
      : Array.isArray(data)
        ? data
        : []
  return {
    candidateId: readString(payload?.candidateId) ?? candidateId,
    entries: list
      .map(normalizeStatusEntry)
      .filter((item): item is CandidateStatusHistoryEntry => item !== null),
  }
}

function listParams(args: ListCandidatesArgs) {
  const params: Record<string, string | number | boolean> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 200)
  if (args.source) params.source = args.source
  if (args.isActive !== undefined) params.isActive = args.isActive
  const skill = args.skill?.trim()
  if (skill) params.skill = skill.slice(0, 100)
  if (args.sortBy) params.sortBy = args.sortBy
  if (args.sortOrder) params.sortOrder = args.sortOrder
  return params
}

function searchParams(args: SearchCandidatesArgs) {
  const params: Record<string, string | number | boolean> = {
    q: args.q.trim().slice(0, 200),
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  if (args.source) params.source = args.source
  if (args.isActive !== undefined) params.isActive = args.isActive
  return params
}

function pageTags(page: CandidatesPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({
      type: 'RecruitmentCandidate' as const,
      id: item.id,
    })),
  ]
}

export function getCandidateErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const candidatesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /recruitment/candidates */
    listCandidates: build.query<CandidatesPage, ListCandidatesArgs | void>({
      query: (args = {}) => ({
        url: '/recruitment/candidates',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizeCandidatesPage(response),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /recruitment/candidates/search */
    searchCandidates: build.query<CandidatesPage, SearchCandidatesArgs>({
      query: (args) => ({
        url: '/recruitment/candidates/search',
        params: searchParams(args),
      }),
      transformResponse: (response: unknown) => normalizeCandidatesPage(response),
      providesTags: (result) => pageTags(result),
    }),

    /**
     * GET /recruitment/candidates/me — active candidate whose email matches the
     * authenticated user (OpenAPI: CandidatesController_findMine). Used by the
     * internal job board; does not create or link profiles.
     */
    getMyCandidate: build.query<BackendCandidate | null, void>({
      query: () => '/recruitment/candidates/me',
      transformResponse: (response: unknown): BackendCandidate | null => {
        const root = asRecord(response)
        const data = root?.data !== undefined ? root.data : response
        if (data === null || data === undefined) return null
        return normalizeCandidateEnvelope(response)
      },
      providesTags: (result) =>
        result
          ? [{ type: 'RecruitmentCandidate' as const, id: result.id }, LIST_TAG]
          : [LIST_TAG],
    }),

    /** GET /recruitment/candidates/:id */
    getCandidate: build.query<BackendCandidate, string>({
      query: (id) => `/recruitment/candidates/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeCandidateEnvelope(response),
      providesTags: (_result, _error, id) => [{ type: 'RecruitmentCandidate', id }],
    }),

    /** POST /recruitment/candidates */
    createCandidate: build.mutation<BackendCandidate, CreateCandidateBody>({
      query: (body) => ({
        url: '/recruitment/candidates',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeCandidateEnvelope(response),
      invalidatesTags: [LIST_TAG],
    }),

    /** PATCH /recruitment/candidates/:id */
    updateCandidate: build.mutation<
      BackendCandidate,
      { id: string; body: UpdateCandidateBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/candidates/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeCandidateEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentCandidate', id },
        LIST_TAG,
      ],
    }),

    /** POST /recruitment/candidates/:id/resume — multipart field `file`. */
    uploadCandidateResume: build.mutation<
      BackendCandidate,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const body = new FormData()
        body.append('file', file, file.name)
        return {
          url: `/recruitment/candidates/${encodeURIComponent(id)}/resume`,
          method: 'POST',
          body,
        }
      },
      transformResponse: (response: unknown) => normalizeCandidateEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentCandidate', id },
        LIST_TAG,
      ],
    }),

    /** POST /recruitment/resume/parse — multipart field `file`. */
    parseResume: build.mutation<ResumeParseResult, File>({
      query: (file) => {
        const body = new FormData()
        body.append('file', file, file.name)
        return {
          url: '/recruitment/resume/parse',
          method: 'POST',
          body,
        }
      },
      transformResponse: (response: unknown) => normalizeResumeParseResult(response),
    }),

    /** GET /recruitment/candidates/:id/status */
    getCandidateStatus: build.query<CandidateStatusTimeline, string>({
      query: (id) => `/recruitment/candidates/${encodeURIComponent(id)}/status`,
      transformResponse: (response: unknown, _meta, id) =>
        normalizeCandidateStatusTimeline(response, id),
      providesTags: (_result, _error, id) => [
        { type: 'RecruitmentCandidate', id },
      ],
    }),
  }),
})

export const {
  useListCandidatesQuery,
  useSearchCandidatesQuery,
  useGetMyCandidateQuery,
  useGetCandidateQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useUploadCandidateResumeMutation,
  useParseResumeMutation,
  useGetCandidateStatusQuery,
} = candidatesApi
