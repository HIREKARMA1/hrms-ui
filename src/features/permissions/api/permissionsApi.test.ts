/**
 * Permission catalogue API (GET /permissions).
 *
 * MOCK-BASED ONLY: stubbed `fetch`. Mirrors production OpenAPI. No live API.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import {
  FEATURE_PERMISSION_MAP,
  canAccessFeature,
} from '@/features/rbac/services/permissionAdapter'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import {
  normalizePermission,
  normalizePermissionsPage,
  permissionsApi,
} from './permissionsApi'

const PERMISSION = {
  id: 'perm-1',
  code: 'users:read',
  module: 'users',
  description: 'List and view users',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  roleCount: 3,
  relatedRoles: [
    { id: 'role-1', code: 'HR_ADMIN', name: 'HR Admin' },
    { id: 'role-2', code: 'MANAGER', name: 'Manager' },
    { id: 'role-3', code: 'EMPLOYEE', name: 'Employee' },
  ],
}

function envelope<T>(data: T, message = 'ok') {
  return { success: true as const, message, data }
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function pathOf(request: Request) {
  return new URL(request.url).pathname.replace(/^.*\/api\/v1/, '') || '/'
}

function stubFetch(handler: (request: Request) => Response | Promise<Response>) {
  const calls: Request[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      calls.push(request.clone())
      return handler(request)
    }),
  )
  return calls
}

function makeStore(permissions: string[] | null = ['permissions:read']) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'actor-1',
          email: 'admin@example.test',
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          permissions: permissions ?? [],
          isActive: true,
        },
        rememberMe: false,
      },
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setSessionEnding(false)
})

describe('RBAC for permission catalogue', () => {
  it('gates the page with permissions:read and does not invent grants from the catalogue', () => {
    expect(FEATURE_PERMISSION_MAP['module.permissions']).toBe('permissions:read')
    expect(canAccessFeature('module.permissions', 'SUPER_ADMIN', ['permissions:read'])).toBe(
      true,
    )
    expect(canAccessFeature('module.permissions', 'SUPER_ADMIN', [])).toBe(false)
    expect(canAccessFeature('module.permissions', 'SUPER_ADMIN', ['users:read'])).toBe(false)
  })
})

describe('normalizePermission', () => {
  it('keeps catalogue fields and rejects rows without code/module/id', () => {
    expect(normalizePermission(PERMISSION)).toEqual(PERMISSION)
    expect(normalizePermission({ id: 'x', code: 'a:b' })).toBeNull()
    expect(
      normalizePermission({
        id: 'x',
        code: 'a:b',
        module: 'a',
        description: null,
        _count: { roles: 2 },
      }),
    ).toEqual({
      id: 'x',
      code: 'a:b',
      module: 'a',
      description: null,
      createdAt: '',
      updatedAt: '',
      roleCount: 2,
      relatedRoles: [],
    })
  })
})

describe('listPermissions', () => {
  it('GETs /permissions with Bearer auth and pagination/search/module params', async () => {
    const calls = stubFetch(() =>
      jsonResponse(
        200,
        envelope({
          items: [PERMISSION],
          pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
        }),
      ),
    )
    const store = makeStore()
    const page = await store
      .dispatch(
        permissionsApi.endpoints.listPermissions.initiate({
          page: 2,
          limit: 20,
          search: 'users',
          module: 'users',
        }),
      )
      .unwrap()

    expect(pathOf(calls[0])).toBe('/permissions')
    expect(calls[0].method).toBe('GET')
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-token')
    const url = new URL(calls[0].url)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('20')
    expect(url.searchParams.get('search')).toBe('users')
    expect(url.searchParams.get('module')).toBe('users')
    expect(page.items).toEqual([PERMISSION])
    expect(page.pagination.total).toBe(21)
  })

  it('handles an empty permission list', async () => {
    stubFetch(() =>
      jsonResponse(
        200,
        envelope({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      ),
    )
    const store = makeStore()
    const page = await store.dispatch(permissionsApi.endpoints.listPermissions.initiate()).unwrap()
    expect(page.items).toEqual([])
    expect(page.pagination.totalPages).toBe(0)
  })

  it('surfaces 401 unauthorized', async () => {
    stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
    const store = makeStore()
    // Without refresh succeeding, the list fails as 401.
    await expect(
      store.dispatch(permissionsApi.endpoints.listPermissions.initiate()).unwrap(),
    ).rejects.toMatchObject({ status: 401 })
  })

  it('surfaces 403 forbidden', async () => {
    stubFetch(() =>
      jsonResponse(403, { statusCode: 403, message: 'Missing permissions:read permission' }),
    )
    const store = makeStore()
    await expect(
      store.dispatch(permissionsApi.endpoints.listPermissions.initiate()).unwrap(),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('surfaces server errors', async () => {
    stubFetch(() => jsonResponse(500, { statusCode: 500, message: 'Server error' }))
    const store = makeStore()
    await expect(
      store.dispatch(permissionsApi.endpoints.listPermissions.initiate()).unwrap(),
    ).rejects.toMatchObject({ status: 500 })
  })

  it('surfaces network failures', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    const store = makeStore()
    await expect(
      store.dispatch(permissionsApi.endpoints.listPermissions.initiate()).unwrap(),
    ).rejects.toBeTruthy()
  })

  it('does not invent a name field when normalizing pages', () => {
    const page = normalizePermissionsPage(
      envelope({
        items: [{ id: '1', code: 'x:y', module: 'x', description: 'desc', name: 'Ignored' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    )
    expect(page.items[0]).toEqual({
      id: '1',
      code: 'x:y',
      module: 'x',
      description: 'desc',
      roleCount: 0,
      relatedRoles: [],
      createdAt: '',
      updatedAt: '',
    })
    expect(page.items[0]).not.toHaveProperty('name')
  })
})
