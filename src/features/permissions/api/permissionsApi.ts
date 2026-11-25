/**
 * RTK Query endpoints for Permission Management catalogue (production
 * `GET /permissions`, `permissions:read`).
 *
 * This catalogue is informational only — it does not grant access. Session
 * authorization continues to use `/auth/me` (and login) permission codes.
 */
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { baseApi } from '@/services/api/baseApi'

import type {
  BackendPermission,
  ListPermissionsArgs,
  PermissionRelatedRole,
  PermissionsPage,
  PermissionsPagination,
} from './permissionsApi.types'

export const PERMISSIONS_PAGE_SIZE = 20
export const PERMISSIONS_MAX_LIMIT = 100

const LIST_TAG = { type: 'Permission' as const, id: 'LIST' }

function clampLimit(limit: number | undefined) {
  return Math.min(
    Math.max(Math.trunc(limit ?? PERMISSIONS_PAGE_SIZE), 1),
    PERMISSIONS_MAX_LIMIT,
  )
}

function clampPage(page: number | undefined) {
  return Math.max(Math.trunc(page ?? 1), 1)
}

function listParams(args: ListPermissionsArgs) {
  const params: Record<string, string | number> = {
    page: clampPage(args.page),
    limit: clampLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 120)
  const moduleFilter = args.module?.trim()
  if (moduleFilter) params.module = moduleFilter.slice(0, 64)
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

function readCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return 0
}

/**
 * Normalize one catalogue row. Only fields documented/verified for the
 * permission catalogue are kept; unknown keys are dropped.
 */
export function normalizePermission(raw: unknown): BackendPermission | null {
  const row = asRecord(raw)
  if (!row) return null
  const id = readString(row.id)
  const code = readString(row.code)
  const moduleName = readString(row.module)
  if (!id || !code || !moduleName) return null

  const descriptionRaw = row.description
  const description =
    descriptionRaw === null || descriptionRaw === undefined
      ? null
      : readString(descriptionRaw)

  const countBag = asRecord(row._count)
  const relatedRoles = normalizeRelatedRoles(row.relatedRoles)
  const roleCount = readCount(
    row.roleCount !== undefined
      ? row.roleCount
      : (countBag?.roles ?? relatedRoles.length),
  )

  const createdAt = readString(row.createdAt) ?? ''
  const updatedAt = readString(row.updatedAt) ?? ''

  return {
    id,
    code,
    module: moduleName,
    description,
    createdAt,
    updatedAt,
    roleCount,
    relatedRoles,
  }
}

function normalizeRelatedRoles(raw: unknown): PermissionRelatedRole[] {
  if (!Array.isArray(raw)) return []
  const roles: PermissionRelatedRole[] = []
  for (const entry of raw) {
    const row = asRecord(entry)
    if (!row) continue
    const id = readString(row.id)
    const code = readString(row.code)
    const name = readString(row.name)
    if (!id || !code || !name) continue
    roles.push({ id, code, name })
  }
  return roles
}

function normalizePagination(raw: unknown, itemCount: number): PermissionsPagination {
  const row = asRecord(raw)
  const page = readCount(row?.page) || 1
  const limit = readCount(row?.limit) || PERMISSIONS_PAGE_SIZE
  const total = row?.total !== undefined ? readCount(row.total) : itemCount
  const totalPages =
    row?.totalPages !== undefined
      ? readCount(row.totalPages)
      : total === 0
        ? 0
        : Math.ceil(total / limit)
  return { page, limit, total, totalPages }
}

/** Unwrap + normalize the production list envelope. */
export function normalizePermissionsPage(raw: unknown): PermissionsPage {
  const root = asRecord(raw)
  const data = asRecord(root?.data) ?? root
  const itemsRaw = data?.items
  const items = Array.isArray(itemsRaw)
    ? itemsRaw
        .map((item) => normalizePermission(item))
        .filter((item): item is BackendPermission => item !== null)
    : []
  return {
    items,
    pagination: normalizePagination(data?.pagination, items.length),
  }
}

function pageTags(page: PermissionsPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'Permission' as const, id: item.id })),
  ]
}

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** GET /permissions (permissions:read) — catalogue only. */
    listPermissions: build.query<PermissionsPage, ListPermissionsArgs | void>({
      query: (args = {}) => ({
        url: '/permissions',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizePermissionsPage(response),
      providesTags: (result) => pageTags(result),
    }),

    /**
     * Full permission catalogue aggregated client-side across pages.
     * Used for module filters and summary cards on Permission Management.
     */
    listPermissionsCatalog: build.query<BackendPermission[], void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const collected: BackendPermission[] = []
        let page = 1
        let totalPages = 1

        do {
          const result = await baseQuery({
            url: '/permissions',
            params: { page, limit: PERMISSIONS_MAX_LIMIT },
          })

          if (result.error) {
            return { error: result.error as FetchBaseQueryError }
          }

          const normalized = normalizePermissionsPage(result.data)
          collected.push(...normalized.items)
          totalPages = Math.max(normalized.pagination.totalPages, 1)
          page += 1
        } while (page <= totalPages)

        return { data: collected }
      },
      providesTags: [LIST_TAG],
    }),
  }),
})

export const { useListPermissionsQuery, useListPermissionsCatalogQuery } =
  permissionsApi
