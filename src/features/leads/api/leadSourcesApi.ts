/**
 * RTK Query client for Lead Sources (`/lead-sources`).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BackendLeadSource,
  CreateLeadSourceBody,
  LeadSourcesPage,
  ListLeadSourcesArgs,
} from './leadSourcesApi.types'

const LIST_TAG = { type: 'LeadSource' as const, id: 'LIST' }

function listParams(args: ListLeadSourcesArgs | void) {
  const params: Record<string, boolean> = {}
  if (args?.isActive !== undefined) params.isActive = args.isActive
  return params
}

function normaliseCreateBody(body: CreateLeadSourceBody): CreateLeadSourceBody {
  const description = body.description?.trim()
  return {
    code: body.code.trim().toUpperCase(),
    name: body.name.trim(),
    ...(description ? { description } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  }
}

export function getLeadSourceErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const leadSourcesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /lead-sources */
    listLeadSources: build.query<LeadSourcesPage, ListLeadSourcesArgs | void>({
      query: (args) => ({
        url: '/lead-sources',
        params: listParams(args),
      }),
      transformResponse: (response: ApiResponse<LeadSourcesPage>) => unwrapData(response),
      providesTags: (result) => [
        LIST_TAG,
        ...(result?.items ?? []).map((item) => ({
          type: 'LeadSource' as const,
          id: item.id,
        })),
      ],
    }),

    /** POST /lead-sources */
    createLeadSource: build.mutation<BackendLeadSource, CreateLeadSourceBody>({
      query: (body) => ({
        url: '/lead-sources',
        method: 'POST',
        body: normaliseCreateBody(body),
      }),
      transformResponse: (response: ApiResponse<BackendLeadSource>) => unwrapData(response),
      invalidatesTags: [LIST_TAG],
    }),
  }),
})

export const {
  useListLeadSourcesQuery,
  useCreateLeadSourceMutation,
} = leadSourcesApi
