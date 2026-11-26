/**
 * RTK Query client for Leads Management (`/leads`).
 * Sources/categories live in `leadSourcesApi` / `leadCategoriesApi`.
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  AddLeadNoteBody,
  AssignLeadBody,
  BackendLead,
  BackendLeadPriority,
  BackendLeadStatus,
  CreateLeadBody,
  DuplicateCheckBody,
  DuplicateCheckResult,
  LeadAnalyticsArgs,
  LeadAnalyticsResult,
  LeadsPage,
  ListLeadsArgs,
  UpdateLeadBody,
  UpdateLeadPriorityBody,
  UpdateLeadStatusBody,
} from './leadsApi.types'

export const LEADS_PAGE_SIZE = 20
export const LEADS_MAX_LIMIT = 100

const LIST_TAG = { type: 'Lead' as const, id: 'LIST' }
const ANALYTICS_TAG = { type: 'Lead' as const, id: 'ANALYTICS' }

const STATUSES = new Set<BackendLeadStatus>([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
])

const PRIORITIES = new Set<BackendLeadPriority>(['LOW', 'MEDIUM', 'HIGH'])

function clampLimit(limit: number | undefined) {
  return Math.min(Math.max(Math.trunc(limit ?? LEADS_PAGE_SIZE), 1), LEADS_MAX_LIMIT)
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListLeadsArgs) {
  const params: Record<string, string | number> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 200)
  if (args.status && STATUSES.has(args.status)) params.status = args.status
  if (args.priority && PRIORITIES.has(args.priority)) params.priority = args.priority
  if (args.sourceId?.trim()) params.sourceId = args.sourceId.trim()
  if (args.categoryId?.trim()) params.categoryId = args.categoryId.trim()
  if (args.assignedEmployeeId?.trim()) {
    params.assignedEmployeeId = args.assignedEmployeeId.trim()
  }
  return params
}

function pageTags(page: LeadsPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'Lead' as const, id: item.id })),
  ]
}

function invalidateLead(id: string) {
  return [{ type: 'Lead' as const, id }, LIST_TAG, ANALYTICS_TAG] as const
}

export function getLeadErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /leads */
    listLeads: build.query<LeadsPage, ListLeadsArgs | void>({
      query: (args = {}) => ({
        url: '/leads',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<LeadsPage>) => unwrapData(response),
      providesTags: (result) => pageTags(result),
    }),

    /** GET /leads/:id */
    getLead: build.query<BackendLead, string>({
      query: (id) => `/leads/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      providesTags: (_result, _error, id) => [{ type: 'Lead', id }],
    }),

    /** GET /leads/analytics */
    getLeadAnalytics: build.query<LeadAnalyticsResult, LeadAnalyticsArgs | void>({
      query: (args = {}) => ({
        url: '/leads/analytics',
        params: {
          ...(args?.fromDate ? { fromDate: args.fromDate } : {}),
          ...(args?.toDate ? { toDate: args.toDate } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<LeadAnalyticsResult>) => unwrapData(response),
      providesTags: [ANALYTICS_TAG],
    }),

    /** POST /leads */
    createLead: build.mutation<BackendLead, CreateLeadBody>({
      query: (body) => ({
        url: '/leads',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: [LIST_TAG, ANALYTICS_TAG],
    }),

    /** PATCH /leads/:id */
    updateLead: build.mutation<BackendLead, { id: string; body: UpdateLeadBody }>({
      query: ({ id, body }) => ({
        url: `/leads/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [...invalidateLead(id)],
    }),

    /** DELETE /leads/:id */
    deleteLead: build.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/leads/${encodeURIComponent(id)}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) => unwrapData(response),
      invalidatesTags: (_result, _error, id) => [...invalidateLead(id)],
    }),

    /** PATCH /leads/:id/assign */
    assignLead: build.mutation<BackendLead, { id: string; body: AssignLeadBody }>({
      query: ({ id, body }) => ({
        url: `/leads/${encodeURIComponent(id)}/assign`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [...invalidateLead(id)],
    }),

    /** PATCH /leads/:id/status */
    updateLeadStatus: build.mutation<BackendLead, { id: string; body: UpdateLeadStatusBody }>({
      query: ({ id, body }) => ({
        url: `/leads/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [...invalidateLead(id)],
    }),

    /** PATCH /leads/:id/priority */
    updateLeadPriority: build.mutation<
      BackendLead,
      { id: string; body: UpdateLeadPriorityBody }
    >({
      query: ({ id, body }) => ({
        url: `/leads/${encodeURIComponent(id)}/priority`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [...invalidateLead(id)],
    }),

    /** POST /leads/:id/notes */
    addLeadNote: build.mutation<BackendLead, { id: string; body: AddLeadNoteBody }>({
      query: ({ id, body }) => ({
        url: `/leads/${encodeURIComponent(id)}/notes`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BackendLead>) => unwrapData(response),
      invalidatesTags: (_result, _error, { id }) => [...invalidateLead(id)],
    }),

    /** POST /leads/duplicate-check */
    checkLeadDuplicates: build.mutation<DuplicateCheckResult, DuplicateCheckBody>({
      query: (body) => ({
        url: '/leads/duplicate-check',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<DuplicateCheckResult>) => unwrapData(response),
    }),
  }),
})

export const {
  useListLeadsQuery,
  useGetLeadQuery,
  useGetLeadAnalyticsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useAssignLeadMutation,
  useUpdateLeadStatusMutation,
  useUpdateLeadPriorityMutation,
  useAddLeadNoteMutation,
  useCheckLeadDuplicatesMutation,
  useLazyListLeadsQuery,
  useLazyGetLeadQuery,
} = leadsApi
