/**
 * RTK Query client for Lead Categories (`/lead-categories`).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  BackendLeadCategory,
  CreateLeadCategoryBody,
  LeadCategoriesPage,
  ListLeadCategoriesArgs,
} from './leadCategoriesApi.types'

const LIST_TAG = { type: 'LeadCategory' as const, id: 'LIST' }

function listParams(args: ListLeadCategoriesArgs | void) {
  const params: Record<string, boolean> = {}
  if (args?.isActive !== undefined) params.isActive = args.isActive
  return params
}

function normaliseCreateBody(body: CreateLeadCategoryBody): CreateLeadCategoryBody {
  const description = body.description?.trim()
  return {
    code: body.code.trim().toUpperCase(),
    name: body.name.trim(),
    ...(description ? { description } : {}),
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
  }
}

export function getLeadCategoryErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const leadCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /lead-categories */
    listLeadCategories: build.query<LeadCategoriesPage, ListLeadCategoriesArgs | void>({
      query: (args) => ({
        url: '/lead-categories',
        params: listParams(args),
      }),
      transformResponse: (response: ApiResponse<LeadCategoriesPage>) => unwrapData(response),
      providesTags: (result) => [
        LIST_TAG,
        ...(result?.items ?? []).map((item) => ({
          type: 'LeadCategory' as const,
          id: item.id,
        })),
      ],
    }),

    /** POST /lead-categories */
    createLeadCategory: build.mutation<BackendLeadCategory, CreateLeadCategoryBody>({
      query: (body) => ({
        url: '/lead-categories',
        method: 'POST',
        body: normaliseCreateBody(body),
      }),
      transformResponse: (response: ApiResponse<BackendLeadCategory>) => unwrapData(response),
      invalidatesTags: [LIST_TAG],
    }),
  }),
})

export const {
  useListLeadCategoriesQuery,
  useCreateLeadCategoryMutation,
} = leadCategoriesApi
