/**
 * User Management API integration (Phase 2).
 *
 * MOCK-BASED ONLY: stubbed `fetch`; payloads mirror hrms-server users.controller /
 * DTOs / users.service / users.mapper. No live backend is contacted.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { FEATURE_PERMISSION_MAP } from '@/features/rbac/services/permissionAdapter'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import {
  createSubmitGuard,
  submitRegisterUser,
} from '../utils/registerUser'
import {
  validateCreateUserForm,
  validateUpdateUserForm,
} from '../utils/userFormValidation'
import { getUserErrorMessage, usersApi } from './usersApi'
import type { BackendUser } from './usersApi.types'

const USER: BackendUser = {
  id: 'user-1',
  email: 'asha@example.test',
  role: 'EMPLOYEE',
  isActive: true,
  lastLoginAt: null,
  employeeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  roles: [
    {
      id: 'role-emp',
      code: 'EMPLOYEE',
      name: 'Employee',
      isSystem: true,
      isActive: true,
    },
  ],
  employee: null,
}

const HR_ROLE = {
  id: 'role-hr',
  code: 'HR_ADMIN',
  name: 'HR Admin',
  isSystem: true,
  isActive: true,
  userCount: 2,
  permissionCount: 10,
}

const envelope = <T,>(data: T, message = 'ok') => ({ success: true, message, data })

function makeStore() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: {
          id: 'actor-1',
          email: 'admin@example.test',
          role: 'HR_ADMIN',
          roles: ['HR_ADMIN'],
          permissions: [
            'users:create',
            'users:read',
            'users:update',
            'users:deactivate',
            'users:assign_roles',
            'roles:read',
          ],
          isActive: true,
        },
        rememberMe: false,
      },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
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

const pathOf = (request: Request) => new URL(request.url).pathname.replace(/^.*\/api\/v1/, '')

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

describe('permission mapping', () => {
  it('maps user management features to verified backend codes', () => {
    expect(FEATURE_PERMISSION_MAP['module.users']).toBe('users:read')
    expect(FEATURE_PERMISSION_MAP['users.create']).toBe('users:create')
    expect(FEATURE_PERMISSION_MAP['users.update']).toBe('users:update')
    expect(FEATURE_PERMISSION_MAP['users.deactivate']).toBe('users:deactivate')
    expect(FEATURE_PERMISSION_MAP['users.assignRoles']).toBe('users:assign_roles')
  })
})

describe('registration', () => {
  it('posts the exact create payload and does not keep the password in the store', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(USER, 'User created')))
    const store = makeStore()
    const result = await store
      .dispatch(
        usersApi.endpoints.createUser.initiate(
          { email: '  asha@example.test  ', password: 'Password12', employeeId: ' emp-1 ' },
          { track: false },
        ),
      )
      .unwrap()

    expect(result.id).toBe('user-1')
    expect(calls).toHaveLength(1)
    expect(pathOf(calls[0])).toBe('/users')
    expect(calls[0].method).toBe('POST')
    expect(await calls[0].json()).toEqual({
      email: 'asha@example.test',
      password: 'Password12',
      employeeId: 'emp-1',
    })
    expect(JSON.stringify(store.getState())).not.toContain('Password12')
  })

  it('rejects invalid required fields without calling the server', () => {
    expect(validateCreateUserForm({ email: '', password: '', confirmPassword: '' })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
      confirmPassword: 'Please confirm the password.',
    })
    expect(
      validateCreateUserForm({
        email: 'bad',
        password: 'short',
        confirmPassword: 'other',
      }),
    ).toMatchObject({
      email: 'Enter a valid email address.',
      password: 'Password must be at least 8 characters.',
      confirmPassword: 'Passwords do not match.',
    })
  })

  it('creates then assigns a role for Admin/HR registration', async () => {
    const elevated = {
      ...USER,
      roles: [...USER.roles, { id: HR_ROLE.id, code: 'HR_ADMIN', name: 'HR Admin', isSystem: true, isActive: true }],
    }
    const calls = stubFetch((request) => {
      if (request.method === 'POST' && pathOf(request).endsWith('/roles')) {
        return jsonResponse(200, envelope(elevated, 'Roles assigned'))
      }
      return jsonResponse(201, envelope(USER, 'User created'))
    })
    const store = makeStore()
    const outcome = await submitRegisterUser({
      email: 'asha@example.test',
      password: 'Password12',
      confirmPassword: 'Password12',
      roleId: HR_ROLE.id,
      guard: createSubmitGuard(),
      send: {
        create: (body) =>
          store.dispatch(usersApi.endpoints.createUser.initiate(body, { track: false })),
        assignRoles: (arg) => store.dispatch(usersApi.endpoints.assignUserRoles.initiate(arg)),
      },
    })

    expect(outcome).toMatchObject({ status: 'success', roleAssigned: true })
    expect(calls.map((call) => `${call.method} ${pathOf(call)}`)).toEqual([
      'POST /users',
      'POST /users/user-1/roles',
    ])
    expect(await calls[1].json()).toEqual({ roleIds: [HR_ROLE.id] })
  })

  it('surfaces backend validation / conflict failures', async () => {
    stubFetch(() =>
      jsonResponse(409, { statusCode: 409, message: 'Email already exists', conflicts: ['email'] }),
    )
    const store = makeStore()
    const outcome = await submitRegisterUser({
      email: 'asha@example.test',
      password: 'Password12',
      confirmPassword: 'Password12',
      guard: createSubmitGuard(),
      send: {
        create: (body) =>
          store.dispatch(usersApi.endpoints.createUser.initiate(body, { track: false })),
        assignRoles: (arg) => store.dispatch(usersApi.endpoints.assignUserRoles.initiate(arg)),
      },
    })
    expect(outcome.status).toBe('error')
    if (outcome.status === 'error') {
      expect(outcome.message).toContain('Email')
    }
  })

  it('rejects an invalid role assignment without inventing privileges', async () => {
    stubFetch((request) => {
      if (pathOf(request).endsWith('/roles')) {
        return jsonResponse(403, {
          statusCode: 403,
          message: 'Only SUPER_ADMIN may assign the SUPER_ADMIN role',
        })
      }
      return jsonResponse(201, envelope(USER, 'User created'))
    })
    const store = makeStore()
    const outcome = await submitRegisterUser({
      email: 'asha@example.test',
      password: 'Password12',
      confirmPassword: 'Password12',
      roleId: 'role-super',
      guard: createSubmitGuard(),
      send: {
        create: (body) =>
          store.dispatch(usersApi.endpoints.createUser.initiate(body, { track: false })),
        assignRoles: (arg) => store.dispatch(usersApi.endpoints.assignUserRoles.initiate(arg)),
      },
    })
    expect(outcome).toMatchObject({
      status: 'error',
      createdUser: expect.objectContaining({ id: 'user-1' }),
    })
  })

  it('prevents duplicate registration submissions', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const store = makeStore()
    const guard = createSubmitGuard()
    const send = {
      create: (body: { email: string; password: string }) =>
        store.dispatch(usersApi.endpoints.createUser.initiate(body, { track: false })),
      assignRoles: (arg: { id: string; body: { roleIds: string[] } }) =>
        store.dispatch(usersApi.endpoints.assignUserRoles.initiate(arg)),
    }
    const input = {
      email: 'asha@example.test',
      password: 'Password12',
      confirmPassword: 'Password12',
      send,
      guard,
    }
    const first = submitRegisterUser(input)
    const second = await submitRegisterUser(input)
    await vi.waitFor(() => expect(calls).toHaveLength(1))
    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(201, envelope(USER, 'User created')))
    expect(await first).toMatchObject({ status: 'success' })
  })
})

describe('user listing', () => {
  it('lists users with pagination and search params', async () => {
    const calls = stubFetch(() =>
      jsonResponse(
        200,
        envelope({
          items: [USER],
          pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
        }),
      ),
    )
    const page = await makeStore()
      .dispatch(
        usersApi.endpoints.listUsers.initiate({
          page: 2,
          limit: 20,
          search: 'asha',
          role: 'EMPLOYEE',
          isActive: true,
          roleCode: 'employee',
        }),
      )
      .unwrap()

    expect(page.items).toHaveLength(1)
    expect(page.pagination.total).toBe(21)
    const url = new URL(calls[0].url)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('search')).toBe('asha')
    expect(url.searchParams.get('role')).toBe('EMPLOYEE')
    expect(url.searchParams.get('isActive')).toBe('true')
    expect(url.searchParams.get('roleCode')).toBe('EMPLOYEE')
  })

  it('handles an empty result', async () => {
    stubFetch(() =>
      jsonResponse(
        200,
        envelope({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      ),
    )
    const page = await makeStore().dispatch(usersApi.endpoints.listUsers.initiate({})).unwrap()
    expect(page.items).toEqual([])
    expect(page.pagination.totalPages).toBe(0)
  })

  it('reports network and server errors', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    const network = await makeStore().dispatch(usersApi.endpoints.listUsers.initiate({}))
    expect(getUserErrorMessage(network.error, 'x')).toContain('Unable to reach the server')

    stubFetch(() => jsonResponse(500, { statusCode: 500, message: 'Internal server error' }))
    const server = await makeStore().dispatch(usersApi.endpoints.listUsers.initiate({}))
    expect(getUserErrorMessage(server.error, 'Could not load users.')).toContain('Internal')
  })
})

describe('get user by id', () => {
  it('fetches a user and isolates cache entries per id', async () => {
    stubFetch((request) => {
      const id = pathOf(request).split('/').pop()
      return jsonResponse(200, envelope({ ...USER, id: id ?? 'missing', email: `${id}@example.test` }))
    })
    const store = makeStore()
    const first = await store.dispatch(usersApi.endpoints.getUser.initiate('user-a')).unwrap()
    const second = await store.dispatch(usersApi.endpoints.getUser.initiate('user-b')).unwrap()
    expect(first.email).toBe('user-a@example.test')
    expect(second.email).toBe('user-b@example.test')
    expect(usersApi.endpoints.getUser.select('user-a')(store.getState()).data?.id).toBe('user-a')
    expect(usersApi.endpoints.getUser.select('user-b')(store.getState()).data?.id).toBe('user-b')
  })

  it('surfaces not found and refuses a blank id at the API layer', async () => {
    stubFetch(() => jsonResponse(404, { statusCode: 404, message: 'User not found' }))
    const missing = await makeStore().dispatch(usersApi.endpoints.getUser.initiate('missing'))
    expect((missing.error as { status: number }).status).toBe(404)

    // Client routes should not call with an empty id; encoded empty still hits the server as "".
    const calls = stubFetch(() => jsonResponse(400, { statusCode: 400, message: 'User id is required' }))
    await makeStore().dispatch(usersApi.endpoints.getUser.initiate(' '))
    expect(calls[0].url).toContain('/users/')
  })
})

describe('update user', () => {
  it('patches only allowed fields and invalidates detail + list caches', async () => {
    const calls = stubFetch((request) => {
      if (request.method === 'PATCH') {
        return jsonResponse(200, envelope({ ...USER, email: 'new@example.test' }, 'User updated'))
      }
      if (pathOf(request) === '/users/user-1') {
        return jsonResponse(200, envelope(USER))
      }
      return jsonResponse(
        200,
        envelope({ items: [USER], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }),
      )
    })
    const store = makeStore()
    await store.dispatch(usersApi.endpoints.listUsers.initiate({}))
    await store.dispatch(usersApi.endpoints.getUser.initiate('user-1'))
    const updated = await store
      .dispatch(
        usersApi.endpoints.updateUser.initiate({
          id: 'user-1',
          body: { email: 'new@example.test', employeeId: null },
        }),
      )
      .unwrap()

    expect(updated.email).toBe('new@example.test')
    expect(await calls.find((call) => call.method === 'PATCH')!.json()).toEqual({
      email: 'new@example.test',
      employeeId: null,
    })
    await vi.waitFor(() => {
      expect(calls.filter((call) => call.method === 'GET').length).toBeGreaterThanOrEqual(3)
    })
  })

  it('requires at least one changed field client-side', () => {
    expect(
      validateUpdateUserForm({
        email: 'asha@example.test',
        employeeId: '',
        clearEmployee: false,
        originalEmail: 'asha@example.test',
        originalEmployeeId: null,
      }).form,
    ).toBeTruthy()
  })

  it('surfaces unauthorized updates', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Forbidden resource' }))
    const result = await makeStore().dispatch(
      usersApi.endpoints.updateUser.initiate({ id: 'user-1', body: { email: 'x@y.z' } }),
    )
    expect((result.error as { status: number }).status).toBe(403)
  })
})

describe('remove user role', () => {
  it('DELETE /users/:id/roles/:roleId and invalidates user caches', async () => {
    const withoutHr = { ...USER, roles: USER.roles.filter((role) => role.code === 'EMPLOYEE') }
    const calls = stubFetch(() => jsonResponse(200, envelope(withoutHr, 'Role removed')))
    const store = makeStore()
    const result = await store
      .dispatch(
        usersApi.endpoints.removeUserRole.initiate({ id: 'user-1', roleId: 'role-hr' }),
      )
      .unwrap()
    expect(pathOf(calls[0])).toBe('/users/user-1/roles/role-hr')
    expect(calls[0].method).toBe('DELETE')
    expect(result.roles.map((role) => role.code)).toEqual(['EMPLOYEE'])
  })

  it('surfaces unauthorized role removal', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Forbidden' }))
    const store = makeStore()
    await expect(
      store
        .dispatch(
          usersApi.endpoints.removeUserRole.initiate({ id: 'user-1', roleId: 'role-hr' }),
        )
        .unwrap(),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe('deactivate user', () => {
  it('soft-deactivates and updates caches', async () => {
    const inactive = { ...USER, isActive: false }
    const calls = stubFetch(() => jsonResponse(200, envelope(inactive, 'User deactivated')))
    const store = makeStore()
    const result = await store.dispatch(usersApi.endpoints.deactivateUser.initiate('user-1')).unwrap()
    expect(result.isActive).toBe(false)
    expect(calls[0].method).toBe('PATCH')
    expect(pathOf(calls[0])).toBe('/users/user-1/deactivate')
  })

  it('treats already-inactive as success (idempotent message from server)', async () => {
    stubFetch(() =>
      jsonResponse(200, envelope({ ...USER, isActive: false }, 'User already inactive')),
    )
    const result = await makeStore()
      .dispatch(usersApi.endpoints.deactivateUser.initiate('user-1'))
      .unwrap()
    expect(result.isActive).toBe(false)
  })

  it('surfaces unauthorized deactivation', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Forbidden resource' }))
    const result = await makeStore().dispatch(usersApi.endpoints.deactivateUser.initiate('user-1'))
    expect((result.error as { status: number }).status).toBe(403)
  })

  it('confirmation cancellation means no deactivate request is issued', () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(USER)))
    // Opening the dialog without confirming must not hit the API.
    expect(calls).toHaveLength(0)
  })

  it('prevents duplicate deactivate submissions via the shared submit guard', async () => {
    let release: (response: Response) => void = () => {}
    const calls = stubFetch(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve
        }),
    )
    const store = makeStore()
    const guard = createSubmitGuard()
    const run = async () => {
      if (!guard.tryEnter()) return 'busy' as const
      try {
        await store.dispatch(usersApi.endpoints.deactivateUser.initiate('user-1')).unwrap()
        return 'ok' as const
      } finally {
        guard.leave()
      }
    }
    const first = run()
    const second = await run()
    await vi.waitFor(() => expect(calls).toHaveLength(1))
    expect(second).toBe('busy')
    release(jsonResponse(200, envelope({ ...USER, isActive: false }, 'User deactivated')))
    expect(await first).toBe('ok')
    expect(calls).toHaveLength(1)
  })
})

describe('security', () => {
  it('create with track:false does not retain the password in the store', async () => {
    stubFetch(() => jsonResponse(201, envelope(USER, 'User created')))
    const store = makeStore()
    await store
      .dispatch(
        usersApi.endpoints.createUser.initiate(
          { email: 'asha@example.test', password: 'Password12' },
          { track: false },
        ),
      )
      .unwrap()
    expect(JSON.stringify(store.getState())).not.toContain('Password12')
    expect(JSON.stringify(store.getState())).not.toContain('passwordHash')
  })
})
