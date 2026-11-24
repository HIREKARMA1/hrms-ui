import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  ListPermissionsParams,
  PermissionResponse,
  PermissionsListData,
} from './permissionsApi.types'

const PERMISSIONS_LIST_TAG = { type: 'Role' as const, id: 'PERMISSIONS_LIST' }
const PERMISSIONS_CATALOG_TAG = {
  type: 'Role' as const,
  id: 'PERMISSIONS_CATALOG',
}

/**
 * Permission Management endpoints — injects into shared `baseApi`
 * (auth / token handling already configured there).
 */
export const permissionManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /permissions — paginated catalog with search + module filters. */
    listPermissions: build.query<PermissionsListData, ListPermissionsParams | void>({
      query: (params) => ({
        url: '/permissions',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.module ? { module: params.module } : {}),
        },
      }),
      transformResponse: (response: ApiResponse<PermissionsListData>) =>
        unwrapData(response),
      providesTags: [PERMISSIONS_LIST_TAG],
    }),

    /**
     * Full catalog (paginated API aggregated client-side) for summary cards
     * and module filter options — not page-level counts.
     */
    listPermissionsCatalog: build.query<PermissionResponse[], void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const collected: PermissionResponse[] = []
        let page = 1
        let totalPages = 1

        do {
          const result = await baseQuery({
            url: '/permissions',
            params: { page, limit: 100 },
          })

          if (result.error) {
            return { error: result.error as FetchBaseQueryError }
          }

          const payload = unwrapData(
            result.data as ApiResponse<PermissionsListData>,
          )
          collected.push(...payload.items)
          totalPages = Math.max(payload.pagination.totalPages, 1)
          page += 1
        } while (page <= totalPages)

        return { data: collected }
      },
      providesTags: [PERMISSIONS_CATALOG_TAG],
    }),
  }),
})

export const {
  useListPermissionsQuery,
  useListPermissionsCatalogQuery,
} = permissionManagementApi
