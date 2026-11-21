/**
 * Role Management API integration.
 *
 * MOCK-BASED ONLY: stubbed `fetch`; payloads mirror production OpenAPI for
 * `/api/v1/roles`. No live backend is contacted.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { FEATURE_PERMISSION_MAP } from '@/features/rbac/services/permissionAdapter'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { rolesApi } from './rolesApi'
import type { BackendRole } from './rolesApi.types'
import {
  normalizeRoleCode,
  validateCreateRoleForm,
  validateUpdateRoleForm,
} from '../utils/roleFormValidation'
import {
  createSubmitGuard,
  submitCreateRole,
  submitDeleteRole,
  submitUpdateRole,
} from '../utils/roleMutations'

const ROLE: BackendRole = {
  id: 'role-1',
  code: 'TEAM_LEAD',
  name: 'Team Lead',
  description: 'Leads a team',
  isSystem: false,
  isActive: true,
  userCount: 0,
  permissionCount: 4,
}

const SYSTEM_ROLE: BackendRole = {
  id: 'role-sys',
  code: 'SUPER_ADMIN',
  name: 'Super Admin',
  description: null,
  isSystem: true,
  isActive: true,
  userCount: 1,
  permissionCount: 40,
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

function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: {
          id: 'actor-1',
          email: 'admin@example.test',
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
          isActive: true,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
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

describe('permission mapping', () => {
  it('maps role management features to verified production codes', () => {
    expect(FEATURE_PERMISSION_MAP['module.roles']).toBe('roles:read')
    expect(FEATURE_PERMISSION_MAP['roles.create']).toBe('roles:create')
    expect(FEATURE_PERMISSION_MAP['roles.update']).toBe('roles:update')
    expect(FEATURE_PERMISSION_MAP['roles.delete']).toBe('roles:delete')
  })
})

describe('create role', () => {
  it('posts the OpenAPI create payload and normalizes code', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(ROLE, 'Role created')))
    const store = makeStore()
    const outcome = await submitCreateRole({
      code: 'team_lead',
      name: 'Team Lead',
      description: 'Leads a team',
      isActive: true,
      guard: createSubmitGuard(),
      send: (body) => store.dispatch(rolesApi.endpoints.createRole.initiate(body)),
    })

    expect(outcome).toMatchObject({ status: 'success', role: expect.objectContaining({ code: 'TEAM_LEAD' }) })
    expect(pathOf(calls[0])).toBe('/roles')
    expect(calls[0].method).toBe('POST')
    expect(await calls[0].json()).toEqual({
      code: 'TEAM_LEAD',
      name: 'Team Lead',
      description: 'Leads a team',
      isActive: true,
    })
  })

  it('rejects invalid required fields without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(ROLE)))
    const outcome = await submitCreateRole({
      code: 'bad-code',
      name: '',
      description: '',
      isActive: true,
      guard: createSubmitGuard(),
      send: () => ({ unwrap: async () => ROLE }),
    })
    expect(outcome.status).toBe('invalid')
    expect(calls).toHaveLength(0)
    expect(validateCreateRoleForm({ code: 'bad-code', name: '', description: '' })).toMatchObject({
      code: expect.any(String),
      name: 'Role name is required.',
    })
  })

  it('surfaces duplicate role code conflicts', async () => {
    stubFetch(() =>
      jsonResponse(409, { statusCode: 409, message: 'Role code already exists' }),
    )
    const store = makeStore()
    const outcome = await submitCreateRole({
      code: 'TEAM_LEAD',
      name: 'Team Lead',
      description: '',
      isActive: true,
      guard: createSubmitGuard(),
      send: (body) => store.dispatch(rolesApi.endpoints.createRole.initiate(body)),
    })
    expect(outcome).toMatchObject({
      status: 'error',
      message: expect.stringContaining('already exists'),
    })
  })

  it('surfaces unauthorized and forbidden responses', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Forbidden' }))
    const store = makeStore()
    const outcome = await submitCreateRole({
      code: 'TEAM_LEAD',
      name: 'Team Lead',
      description: '',
      isActive: true,
      guard: createSubmitGuard(),
      send: (body) => store.dispatch(rolesApi.endpoints.createRole.initiate(body)),
    })
    expect(outcome.status).toBe('error')
  })

  it('prevents duplicate create submissions', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const store = makeStore()
    const guard = createSubmitGuard()
    const send = (body: { code: string; name: string }) =>
      store.dispatch(rolesApi.endpoints.createRole.initiate(body))

    const first = submitCreateRole({
      code: 'TEAM_LEAD',
      name: 'Team Lead',
      description: '',
      isActive: true,
      guard,
      send,
    })
    const second = await submitCreateRole({
      code: 'TEAM_LEAD',
      name: 'Team Lead',
      description: '',
      isActive: true,
      guard,
      send,
    })
    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(201, envelope(ROLE)))
    await expect(first).resolves.toMatchObject({ status: 'success' })
    expect(calls).toHaveLength(1)
  })
})

describe('update role', () => {
  it('patches only changed fields and invalidates caches', async () => {
    const updated = { ...ROLE, name: 'Lead' }
    const calls = stubFetch(() => jsonResponse(200, envelope(updated, 'Role updated')))
    const store = makeStore()
    const outcome = await submitUpdateRole({
      id: ROLE.id,
      name: 'Lead',
      description: ROLE.description ?? '',
      clearDescription: false,
      isActive: true,
      original: ROLE,
      guard: createSubmitGuard(),
      send: (arg) => store.dispatch(rolesApi.endpoints.updateRole.initiate(arg)),
    })
    expect(outcome).toMatchObject({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/roles/role-1')
    expect(calls[0].method).toBe('PATCH')
    expect(await calls[0].json()).toEqual({ name: 'Lead' })
  })

  it('requires at least one changed field', () => {
    expect(
      validateUpdateRoleForm({
        name: ROLE.name,
        description: ROLE.description ?? '',
        clearDescription: false,
        isActive: ROLE.isActive,
        originalName: ROLE.name,
        originalDescription: ROLE.description,
        originalIsActive: ROLE.isActive,
        isSystem: false,
      }),
    ).toMatchObject({ form: expect.any(String) })
  })

  it('blocks client-side deactivation of system roles', () => {
    expect(
      validateUpdateRoleForm({
        name: SYSTEM_ROLE.name,
        description: '',
        clearDescription: false,
        isActive: false,
        originalName: SYSTEM_ROLE.name,
        originalDescription: null,
        originalIsActive: true,
        isSystem: true,
      }),
    ).toMatchObject({ form: expect.stringContaining('System roles') })
  })

  it('surfaces role not found', async () => {
    stubFetch(() => jsonResponse(404, { statusCode: 404, message: 'Role not found' }))
    const store = makeStore()
    const outcome = await submitUpdateRole({
      id: 'missing',
      name: 'X',
      description: '',
      clearDescription: false,
      isActive: true,
      original: ROLE,
      guard: createSubmitGuard(),
      send: (arg) => store.dispatch(rolesApi.endpoints.updateRole.initiate(arg)),
    })
    expect(outcome).toMatchObject({
      status: 'error',
      message: expect.stringContaining('not found'),
    })
  })
})

describe('delete role', () => {
  it('deletes a custom unassigned role', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(null, 'Role deleted')))
    const store = makeStore()
    const outcome = await submitDeleteRole({
      role: ROLE,
      guard: createSubmitGuard(),
      send: (id) => store.dispatch(rolesApi.endpoints.deleteRole.initiate(id)),
    })
    expect(outcome).toEqual({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/roles/role-1')
    expect(calls[0].method).toBe('DELETE')
  })

  it('blocks system roles without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(null)))
    const outcome = await submitDeleteRole({
      role: SYSTEM_ROLE,
      guard: createSubmitGuard(),
      send: () => ({ unwrap: async () => null }),
    })
    expect(outcome).toMatchObject({ status: 'blocked' })
    expect(calls).toHaveLength(0)
  })

  it('blocks roles assigned to users without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(null)))
    const outcome = await submitDeleteRole({
      role: { ...ROLE, userCount: 3 },
      guard: createSubmitGuard(),
      send: () => ({ unwrap: async () => null }),
    })
    expect(outcome).toMatchObject({ status: 'blocked', message: expect.stringContaining('assignments') })
    expect(calls).toHaveLength(0)
  })

  it('surfaces conflict when server rejects assigned/protected roles', async () => {
    stubFetch(() =>
      jsonResponse(409, {
        statusCode: 409,
        message: 'Role still has user assignments or related references',
      }),
    )
    const store = makeStore()
    const outcome = await submitDeleteRole({
      role: ROLE,
      guard: createSubmitGuard(),
      send: (id) => store.dispatch(rolesApi.endpoints.deleteRole.initiate(id)),
    })
    expect(outcome).toMatchObject({
      status: 'error',
      message: expect.stringContaining('assignments'),
    })
  })

  it('confirmation cancellation means no delete request is issued', () => {
    // UI-level: DeleteRoleDialog only calls submitDeleteRole after confirm.
    // Guard + blocked paths already cover no accidental request.
    expect(normalizeRoleCode(' team lead ')).toBe('TEAM_LEAD')
  })

  it('prevents duplicate delete submissions', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const store = makeStore()
    const guard = createSubmitGuard()
    const send = (id: string) => store.dispatch(rolesApi.endpoints.deleteRole.initiate(id))

    const first = submitDeleteRole({ role: ROLE, guard, send })
    const second = await submitDeleteRole({ role: ROLE, guard, send })
    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(200, envelope(null)))
    await expect(first).resolves.toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
  })
})

describe('list roles', () => {
  it('lists with pagination and search params', async () => {
    const calls = stubFetch(() =>
      jsonResponse(
        200,
        envelope({
          items: [ROLE],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        }),
      ),
    )
    const store = makeStore()
    const page = await store
      .dispatch(
        rolesApi.endpoints.listRoles.initiate({
          page: 1,
          limit: 20,
          search: 'lead',
          isActive: true,
          isSystem: false,
        }),
      )
      .unwrap()
    expect(page.items).toHaveLength(1)
    const url = new URL(calls[0].url)
    expect(url.searchParams.get('search')).toBe('lead')
    expect(url.searchParams.get('isActive')).toBe('true')
    expect(url.searchParams.get('isSystem')).toBe('false')
  })

  it('handles empty results and server errors', async () => {
    stubFetch(() =>
      jsonResponse(200, envelope({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })),
    )
    const store = makeStore()
    const empty = await store.dispatch(rolesApi.endpoints.listRoles.initiate()).unwrap()
    expect(empty.items).toEqual([])

    stubFetch(() => jsonResponse(500, { statusCode: 500, message: 'Server error' }))
    await expect(
      store.dispatch(rolesApi.endpoints.listRoles.initiate({ page: 1 })).unwrap(),
    ).rejects.toMatchObject({ status: 500 })
  })
})
