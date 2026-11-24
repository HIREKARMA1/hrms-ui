import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  PermissionResponse,
  PermissionsListData,
} from './rolesApi.types'

const PERMISSIONS_TAG = { type: 'Role' as const, id: 'PERMISSIONS' }

/**
 * Fetches the full permission catalog (paginated API, aggregated client-side).
 * Required so Role Management can submit real permission UUIDs.
 */
export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /permissions — full catalog (`permissions:read`). */
    listAllPermissions: build.query<PermissionResponse[], void>({
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
      providesTags: [PERMISSIONS_TAG],
    }),
  }),
})

export const { useListAllPermissionsQuery } = permissionsApi
