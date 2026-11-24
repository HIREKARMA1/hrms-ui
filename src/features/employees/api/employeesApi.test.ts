/**
 * Stage 4.6: Employee Management API integration.
 *
 * Mock-based only: every request goes to a stubbed `fetch` and fixtures mirror
 * the hrms-server source (employees.controller / service / schemas, Prisma
 * schema). Nothing here talks to a real backend.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { canAccessFeature, FEATURE_PERMISSION_MAP } from '@/features/rbac/services/permissionAdapter'
import { baseApi } from '@/services/api/baseApi'

import { emptyEmployeeForm } from '../utils/employeeForm'
import { getQueryViewState, isNotFoundError } from '../utils/queryViewState'
import type { BackendEmployee, BackendEmployeeWithSync } from './employeeApi.types'
import {
  buildCreateFormData,
  buildDeviceLinkUpdatePayload,
  buildUpdatePayload,
  CREATE_UNSUPPORTED_FIELDS,
  emptyCreateExtras,
  getPageInfo,
  mapEmployee,
  mapEmployeePage,
  resolveServerFileUrl,
  SERVER_EMPLOYMENT_STATUSES,
  toBackendStatus,
  toFormState,
  toFrontendStatus,
  UPDATE_UNSUPPORTED_FIELDS,
  type EmployeeCreateExtras,
} from './employeeMappers'
import {
  EMPLOYEE_MAX_TAKE,
  employeesApi,
  getEmployeeErrorMessage,
  normaliseEmployeeMutation,
} from './employeesApi'

const API_BASE = 'https://api.example.test/api/v1'

function makeStore(accessToken: string | null = 'access-1') {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: { accessToken, refreshToken: accessToken ? 'refresh-1' : null, user: null, rememberMe: false },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
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

/** Shape of `employeeInclude` from employees.service.ts. */
function backendEmployee(overrides: Partial<BackendEmployee> = {}): BackendEmployee {
  return {
    id: 'emp-uuid-1',
    employeeCode: 'EMP001',
    firstName: 'Asha',
    lastName: 'Rao',
    designation: 'Engineer',
    email: 'asha@example.test',
    phone: '9876543210',
    aadhaar: '123412341234',
    pan: 'ABCDE1234F',
    bloodGroup: 'O+',
    photoUrl: 'https://cdn.example.test/p/asha.png',
    dateOfBirth: '1994-05-06T00:00:00.000Z',
    gender: null,
    maritalStatus: null,
    nationality: null,
    noticePeriod: null,
    uanNumber: '100200300400',
    dateOfJoining: '2024-01-15T00:00:00.000Z',
    employmentStatus: 'ACTIVE',
    role: 'EMPLOYEE',
    departmentId: 'dep-1',
    deviceId: 'DEV-1',
    deviceUserId: '42',
    deviceSyncStatus: 'SYNCED',
    deviceSyncError: null,
    deviceSyncedAt: '2024-01-16T10:00:00.000Z',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-16T10:00:00.000Z',
    bankDetail: {
      id: 'bank-1',
      accountHolderName: 'Asha Rao',
      accountNumber: '000111222333',
      ifsc: 'SBIN0001234',
      bankName: 'SBI',
      branch: null,
    },
    addresses: [
      { id: 'a1', type: 'PERMANENT', line1: '12 MG Road', line2: 'Near Park', city: 'Pune', state: 'MH', pincode: '411001', country: 'India' },
      { id: 'a2', type: 'CURRENT', line1: '5 Lake View', line2: null, city: 'Hyderabad', state: 'TS', pincode: '500001', country: 'India' },
    ],
    documents: [
      {
        id: 'doc-1',
        type: 'GRADUATION',
        fileUrl: '/uploads/employees/EMP001/graduation.pdf',
        originalName: 'degree.pdf',
        mimeType: 'application/pdf',
        createdAt: '2024-01-15T09:00:00.000Z',
      },
    ],
    department: { id: 'dep-1', code: 'ENG', name: 'Engineering' },
    user: { id: 'user-1', email: 'asha@example.test', role: 'EMPLOYEE', isActive: true },
    ...overrides,
  }
}

function validExtras(): EmployeeCreateExtras {
  return {
    ...emptyCreateExtras(),
    aadhaar: '123412341234',
    pan: 'abcde1234f',
    departmentId: 'dep-1',
    deviceId: 'DEV-1',
    photoUrl: 'https://cdn.example.test/p/new.png',
    bankDetail: {
      accountHolderName: 'Ravi Kumar',
      accountNumber: '1234567890',
      ifsc: 'sbin0001234',
      bankName: 'SBI',
      branch: '',
    },
  }
}

function validCreateForm() {
  return {
    ...emptyEmployeeForm(),
    employeeCode: 'EMP002',
    firstName: 'Ravi',
    lastName: 'Kumar',
    designation: 'Analyst',
    bloodGroup: 'B+',
    workEmail: 'ravi@example.test',
    personalMobile: '9123456789',
    dateOfJoining: '2026-11-01',
    permanentAddress: '9 Hill Street\nBlock C',
    city: 'Chennai',
    state: 'TN',
    pinCode: '600001',
    country: 'India',
    profilePictureUrl: 'https://cdn.example.test/p/new.png',
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('status conversion', () => {
  it('maps every backend enum to a UI label and back', () => {
    expect(toFrontendStatus('ACTIVE')).toBe('Active')
    expect(toFrontendStatus('ON_LEAVE')).toBe('On Leave')
    expect(toFrontendStatus('PROBATION')).toBe('Probation')
    expect(toFrontendStatus('TERMINATED')).toBe('Terminated')
    for (const label of SERVER_EMPLOYMENT_STATUSES) {
      expect(toFrontendStatus(toBackendStatus(label) as string)).toBe(label)
    }
  })

  it('returns null for UI-only statuses and a safe label for unknown enums', () => {
    expect(toBackendStatus('Inactive')).toBeNull()
    expect(toBackendStatus('Notice Period')).toBeNull()
    expect(toBackendStatus('Resigned')).toBeNull()
    expect(toBackendStatus('Archived')).toBeNull()
    expect(toFrontendStatus('SOMETHING_NEW')).toBe('Inactive')
  })
})

describe('read mapping', () => {
  it('maps backend fields onto the existing profile model', () => {
    const { profile, server } = mapEmployee(backendEmployee(), API_BASE)
    expect(profile).toMatchObject({
      id: 'emp-uuid-1',
      employeeId: 'EMP001',
      employeeCode: 'EMP001',
      firstName: 'Asha',
      lastName: 'Rao',
      designation: 'Engineer',
      department: 'Engineering',
      workEmail: 'asha@example.test',
      personalMobile: '9876543210',
      bloodGroup: 'O+',
      dateOfBirth: '1994-05-06',
      dateOfJoining: '2024-01-15',
      employmentStatus: 'Active',
      permanentAddress: '12 MG Road\nNear Park',
      currentAddress: '5 Lake View',
      city: 'Pune',
      state: 'MH',
      pinCode: '411001',
      country: 'India',
      profilePictureUrl: 'https://cdn.example.test/p/asha.png',
    })
    expect(server).toMatchObject({
      id: 'emp-uuid-1',
      role: 'EMPLOYEE',
      deviceId: 'DEV-1',
      deviceSyncStatus: 'SYNCED',
      hasLoginAccount: true,
      hasBankDetail: true,
    })
  })

  it('drops sensitive KYC and bank values', () => {
    const record = mapEmployee(backendEmployee(), API_BASE)
    const serialised = JSON.stringify(record)
    expect(serialised).not.toContain('123412341234')
    expect(serialised).not.toContain('ABCDE1234F')
    expect(serialised).not.toContain('000111222333')
    expect(serialised).not.toContain('100200300400')
    expect(serialised).not.toContain('SBIN0001234')
  })

  it('resolves document URLs against the API origin, outside /api/v1', () => {
    const { server } = mapEmployee(backendEmployee(), API_BASE)
    expect(server.documents).toEqual([
      {
        id: 'doc-1',
        type: 'GRADUATION',
        label: 'Graduation certificate',
        fileName: 'degree.pdf',
        mimeType: 'application/pdf',
        url: 'https://api.example.test/uploads/employees/EMP001/graduation.pdf',
        uploadedAt: '2024-01-15',
      },
    ])
    expect(resolveServerFileUrl('https://files.test/x.pdf', API_BASE)).toBe('https://files.test/x.pdf')
  })

  it('handles missing optional fields', () => {
    const { profile, server } = mapEmployee(
      backendEmployee({
        dateOfBirth: null,
        uanNumber: null,
        departmentId: null,
        department: null,
        addresses: [],
        documents: [],
        bankDetail: null,
        user: null,
        deviceId: null,
        deviceUserId: null,
        deviceSyncedAt: null,
      }),
      API_BASE,
    )
    expect(profile.dateOfBirth).toBe('')
    expect(profile.department).toBe('')
    expect(profile.permanentAddress).toBe('')
    expect(profile.city).toBe('')
    expect(server.documents).toEqual([])
    expect(server.hasLoginAccount).toBe(false)
    expect(server.hasBankDetail).toBe(false)
    expect(server.deviceId).toBeNull()
  })

  it('maps optional profile fields and leaves remaining frontend-only fields empty', () => {
    const { profile } = mapEmployee(
      backendEmployee({
        gender: 'Female',
        maritalStatus: 'Married',
        nationality: 'Indian',
        noticePeriod: '60 days',
      }),
      API_BASE,
    )
    expect(profile.gender).toBe('Female')
    expect(profile.maritalStatus).toBe('Married')
    expect(profile.nationality).toBe('Indian')
    expect(profile.noticePeriod).toBe('60 days')
    expect(profile.workLocation).toBe('')
    expect(profile.branch).toBe('')
    expect(profile.activityHistory).toEqual([])
  })
})

describe('pagination', () => {
  it('maps { total, skip, take, items } and tolerates a malformed page', () => {
    const page = mapEmployeePage({ total: 45, skip: 20, take: 20, items: [backendEmployee()] }, API_BASE)
    expect(page.total).toBe(45)
    expect(page.skip).toBe(20)
    expect(page.items[0].server.id).toBe('emp-uuid-1')

    const broken = mapEmployeePage({} as never, API_BASE)
    expect(broken).toEqual({ total: 0, skip: 0, take: 0, items: [] })
  })

  it('computes the visible range and prev/next', () => {
    expect(getPageInfo({ total: 45, skip: 0 }, 20)).toEqual({ from: 1, to: 20, total: 45, hasPrevious: false, hasNext: true })
    expect(getPageInfo({ total: 45, skip: 40 }, 5)).toEqual({ from: 41, to: 45, total: 45, hasPrevious: true, hasNext: false })
    expect(getPageInfo({ total: 0, skip: 0 }, 0)).toEqual({ from: 0, to: 0, total: 0, hasPrevious: false, hasNext: false })
  })

  it('sends skip/take to GET /employees and clamps take to the server limit', async () => {
    const calls = stubFetch(() => jsonResponse(200, { total: 1, skip: 0, take: 100, items: [backendEmployee()] }))
    const store = makeStore()
    const page = await store
      .dispatch(employeesApi.endpoints.listEmployees.initiate({ skip: -5, take: 500 }))
      .unwrap()
    const url = new URL(calls[0].url)
    expect(url.pathname.endsWith('/employees')).toBe(true)
    expect(url.searchParams.get('skip')).toBe('0')
    expect(url.searchParams.get('take')).toBe(String(EMPLOYEE_MAX_TAKE))
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-1')
    expect(page.items[0].profile.employeeCode).toBe('EMP001')
  })

  it('uses GET /employees/search with q', async () => {
    const calls = stubFetch(() => jsonResponse(200, { total: 0, skip: 0, take: 20, items: [] }))
    const store = makeStore()
    const page = await store
      .dispatch(employeesApi.endpoints.searchEmployees.initiate({ q: '  asha ', skip: 20 }))
      .unwrap()
    const url = new URL(calls[0].url)
    expect(url.pathname.endsWith('/employees/search')).toBe(true)
    expect(url.searchParams.get('q')).toBe('asha')
    expect(url.searchParams.get('skip')).toBe('20')
    expect(url.searchParams.get('take')).toBe('20')
    expect(page.items).toEqual([])
  })
})

describe('update payload (PATCH /employees/:id)', () => {
  const original = () => mapEmployee(backendEmployee(), API_BASE)

  it('sends only changed, supported fields', () => {
    const record = original()
    const form = { ...toFormState(record.profile), firstName: 'Asha M', employmentStatus: 'On Leave' as const }
    const result = buildUpdatePayload(form, record)
    expect(result.errors).toEqual([])
    expect(result.unsupported).toEqual([])
    expect(result.body).toEqual({ firstName: 'Asha M', employmentStatus: 'ON_LEAVE' })
  })

  it('returns an empty body when nothing changed', () => {
    const record = original()
    expect(buildUpdatePayload(toFormState(record.profile), record).body).toEqual({})
  })

  it('reports frontend-only, designation and department edits instead of sending them', () => {
    const record = original()
    const form = {
      ...toFormState(record.profile),
      designation: 'Lead Engineer',
      department: 'Product',
      workLocation: 'Remote',
    }
    const result = buildUpdatePayload(form, record)
    expect(result.body).toEqual({})
    expect(result.unsupported.map((u) => u.field).sort()).toEqual([
      'department',
      'designation',
      'workLocation',
    ])
  })

  it('includes optional personal fields when they change', () => {
    const record = original()
    const form = {
      ...toFormState(record.profile),
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      noticePeriod: '90 days',
    }
    const result = buildUpdatePayload(form, record)
    expect(result.errors).toEqual([])
    expect(result.body).toEqual({
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      noticePeriod: '90 days',
    })
  })

  it('reports UI-only statuses and local photo previews as unsupported', () => {
    const record = original()
    const form = {
      ...toFormState(record.profile),
      employmentStatus: 'Notice Period' as const,
      profilePictureUrl: 'blob:http://localhost/abc',
    }
    const result = buildUpdatePayload(form, record)
    expect(result.body).toEqual({})
    expect(result.unsupported.map((u) => u.field)).toEqual(['employmentStatus', 'profilePictureUrl'])
  })

  it('splits the address textarea into line1/line2 with the shared location', () => {
    const record = original()
    const form = { ...toFormState(record.profile), permanentAddress: '1 New Road\nFlat 4', city: 'Mumbai' }
    const result = buildUpdatePayload(form, record)
    expect(result.body.permanentAddress).toEqual({
      line1: '1 New Road',
      line2: 'Flat 4',
      city: 'Mumbai',
      state: 'MH',
      pincode: '411001',
      country: 'India',
    })
  })

  it('sends device link fields when changed', () => {
    const record = mapEmployee(
      backendEmployee({ deviceId: null, deviceUserId: null }),
      API_BASE,
    )
    const result = buildDeviceLinkUpdatePayload(
      { deviceId: 'TW-DEV-01', deviceUserId: '42' },
      record.server,
    )
    expect(result.errors).toEqual([])
    expect(result.body).toEqual({ deviceId: 'TW-DEV-01', deviceUserId: '42' })
  })

  it('requires device ID when linking user ID only', () => {
    const record = mapEmployee(backendEmployee({ deviceId: null, deviceUserId: null }), API_BASE)
    const result = buildDeviceLinkUpdatePayload({ deviceId: '', deviceUserId: '42' }, record.server)
    expect(result.errors).toContain('Biometric device ID is required when linking.')
    expect(result.body).toEqual({})
  })

  it('validates values and refuses to clear fields the API cannot clear', () => {
    const record = original()
    const form = {
      ...toFormState(record.profile),
      workEmail: 'not-an-email',
      personalMobile: '123',
      bloodGroup: '',
      dateOfJoining: '',
      permanentAddress: '',
    }
    const result = buildUpdatePayload(form, record)
    expect(result.errors).toEqual([
      'Work Email must be a valid email.',
      'Mobile Number must have at least 8 characters.',
      'Blood Group cannot be cleared.',
      'Date of Joining cannot be cleared.',
      'Permanent Address cannot be cleared.',
    ])
    expect(result.body).toEqual({})
  })

  it('PATCHes JSON and normalises both response shapes', async () => {
    const updated = backendEmployee({ firstName: 'Asha M' })
    const calls = stubFetch(() => jsonResponse(200, updated))
    const store = makeStore()
    const result = await store
      .dispatch(employeesApi.endpoints.updateEmployee.initiate({ id: 'emp-uuid-1', body: { firstName: 'Asha M' } }))
      .unwrap()
    expect(calls[0].method).toBe('PATCH')
    expect(new URL(calls[0].url).pathname.endsWith('/employees/emp-uuid-1')).toBe(true)
    expect(calls[0].headers.get('Content-Type')).toContain('application/json')
    expect(await calls[0].json()).toEqual({ firstName: 'Asha M' })
    expect(result.record.profile.firstName).toBe('Asha M')
    expect(result.deviceSync).toBeNull()

    const withSync: BackendEmployeeWithSync = {
      employee: updated,
      sync: { database: { status: 'success' }, device: { status: 'failed', message: 'Device offline' } },
    }
    const normalised = normaliseEmployeeMutation(withSync, API_BASE)
    expect(normalised.record.profile.firstName).toBe('Asha M')
    expect(normalised.deviceSync).toEqual({ status: 'failed', message: 'Device offline' })
  })
})

describe('create payload (POST /employees multipart)', () => {
  it('builds the multipart body the backend schema expects', () => {
    const file = new File(['%PDF'], 'degree.pdf', { type: 'application/pdf' })
    const result = buildCreateFormData(validCreateForm(), {
      ...validExtras(),
      uanNumber: '100200300400',
      documents: { graduation: file },
    })
    expect(result.errors).toEqual([])
    const data = result.formData as FormData
    expect(data.get('employeeCode')).toBe('EMP002')
    expect(data.get('employmentStatus')).toBe('PROBATION')
    expect(data.get('role')).toBe('EMPLOYEE')
    expect(data.get('email')).toBe('ravi@example.test')
    expect(data.get('phone')).toBe('9123456789')
    expect(data.get('pan')).toBe('ABCDE1234F')
    expect(data.get('photoUrl')).toBe('https://cdn.example.test/p/new.png')
    expect(data.get('dateOfJoining')).toBe('2026-11-01')
    expect(data.get('uanNumber')).toBe('100200300400')
    expect(data.get('dateOfBirth')).toBeNull()
    expect(data.get('currentAddress')).toBeNull()
    expect(JSON.parse(data.get('permanentAddress') as string)).toEqual({
      line1: '9 Hill Street',
      line2: 'Block C',
      city: 'Chennai',
      state: 'TN',
      pincode: '600001',
      country: 'India',
    })
    expect(JSON.parse(data.get('bankDetail') as string)).toEqual({
      accountHolderName: 'Ravi Kumar',
      accountNumber: '1234567890',
      ifsc: 'SBIN0001234',
      bankName: 'SBI',
    })
    expect((data.get('graduation') as File).name).toBe('degree.pdf')
    expect(data.has('department')).toBe(false)
    expect(data.get('gender')).toBe('Female')
    expect(data.get('maritalStatus')).toBe('Single')
    expect(data.get('nationality')).toBe('Indian')
    expect(data.get('departmentId')).toBe('dep-1')
  })

  it('returns every validation error and no body when required fields are missing', () => {
    const result = buildCreateFormData(emptyEmployeeForm(), emptyCreateExtras())
    expect(result.formData).toBeNull()
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Employee Code is required.',
        'First Name is required.',
        'Designation is required.',
        'Device ID is required.',
        'Work Email must be a valid email.',
        'Aadhaar must be 12 digits.',
        'PAN must look like ABCDE1234F.',
        'Date of Joining is required.',
        'Profile Photo is required. Upload a photo first.',
        'Permanent Address is required.',
        'IFSC must look like SBIN0001234.',
      ]),
    )
  })

  it('rejects unsupported document types and oversized files', () => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' })
    const exe = new File(['MZ'], 'run.exe', { type: 'application/x-msdownload' })
    const result = buildCreateFormData(validCreateForm(), { ...validExtras(), documents: { tenth: big, twelfth: exe } })
    expect(result.formData).toBeNull()
    expect(result.errors).toEqual(['10th marksheet exceeds 10MB.', '12th marksheet must be a PDF, JPEG, PNG or WebP file.'])
  })

  it('lists filled frontend-only fields (including defaults) as not stored', () => {
    const result = buildCreateFormData({ ...validCreateForm(), middleName: 'K' }, validExtras())
    const fields = result.unsupported.map((u) => u.field)
    expect(fields).toEqual(expect.arrayContaining(['middleName', 'workLocation', 'branch']))
    expect(fields).not.toContain('gender')
    expect(fields).not.toContain('firstName')
    expect(fields).not.toContain('department')
  })

  it('refuses statuses the backend cannot store', () => {
    const result = buildCreateFormData({ ...validCreateForm(), employmentStatus: 'Resigned' }, validExtras())
    expect(result.formData).toBeNull()
    expect(result.errors).toContain('Employment Status "Resigned" cannot be stored by the server.')
  })

  it('POSTs multipart without forcing a JSON content type', async () => {
    const calls = stubFetch(() =>
      jsonResponse(201, {
        employee: backendEmployee({ id: 'emp-new', employeeCode: 'EMP002' }),
        sync: { database: { status: 'success' }, device: { status: 'success', message: 'Pushed' } },
      }),
    )
    const store = makeStore()
    const { formData } = buildCreateFormData(validCreateForm(), validExtras())
    const result = await store
      .dispatch(employeesApi.endpoints.createEmployee.initiate(formData as FormData))
      .unwrap()
    expect(calls[0].method).toBe('POST')
    expect(new URL(calls[0].url).pathname.endsWith('/employees')).toBe(true)
    expect(calls[0].headers.get('Content-Type') ?? '').toMatch(/^multipart\/form-data; boundary=/)
    expect(result.record.server.id).toBe('emp-new')
    expect(result.deviceSync?.status).toBe('success')
  })
})

describe('delete and device sync', () => {
  it('DELETE returns the deleted name when API omits sync (current backend)', async () => {
    const calls = stubFetch(() =>
      jsonResponse(200, {
        message: 'Employee deleted from HRMS database (TimeWatch device data is not changed)',
        employee: {
          id: 'emp-uuid-1',
          employeeCode: 'EMP001',
          firstName: 'Asha',
          lastName: 'Rao',
          designation: 'Engineer',
          email: 'a@x.test',
        },
      }),
    )
    const store = makeStore()
    const result = await store.dispatch(employeesApi.endpoints.deleteEmployee.initiate('emp-uuid-1')).unwrap()
    expect(calls[0].method).toBe('DELETE')
    expect(result).toEqual({
      employeeId: 'emp-uuid-1',
      name: 'Asha Rao',
      deviceSync: {
        status: 'skipped',
        message: 'Employee deleted from HRMS database (TimeWatch device data is not changed)',
      },
    })
  })

  it('DELETE still accepts a sync.device payload when present', async () => {
    stubFetch(() =>
      jsonResponse(200, {
        employee: {
          id: 'emp-uuid-1',
          employeeCode: 'EMP001',
          firstName: 'Asha',
          lastName: 'Rao',
          designation: 'Engineer',
          email: 'a@x.test',
        },
        sync: {
          database: { status: 'success' },
          device: { status: 'skipped', message: 'No device linked' },
        },
      }),
    )
    const store = makeStore()
    const result = await store.dispatch(employeesApi.endpoints.deleteEmployee.initiate('emp-uuid-1')).unwrap()
    expect(result.deviceSync).toEqual({ status: 'skipped', message: 'No device linked' })
  })

  it('sync-device sends mode (and verify only for link)', async () => {
    const calls = stubFetch(() =>
      jsonResponse(201, {
        employee: backendEmployee(),
        sync: { database: { status: 'success' }, device: { status: 'success', message: 'Synced' } },
      }),
    )
    const store = makeStore()
    await store.dispatch(employeesApi.endpoints.syncEmployeeDevice.initiate({ id: 'emp-uuid-1' })).unwrap()
    await store
      .dispatch(employeesApi.endpoints.syncEmployeeDevice.initiate({ id: 'emp-uuid-1', mode: 'link', verify: true }))
      .unwrap()
    const push = new URL(calls[0].url)
    expect(push.pathname.endsWith('/employees/emp-uuid-1/sync-device')).toBe(true)
    expect(push.searchParams.get('mode')).toBe('push')
    expect(push.searchParams.has('verify')).toBe(false)
    const link = new URL(calls[1].url)
    expect(link.searchParams.get('mode')).toBe('link')
    expect(link.searchParams.get('verify')).toBe('true')
  })

  it('unwraps the enveloped GET /dashboard/summary', async () => {
    const summary = { totalEmployees: 10, activeEmployees: 7, inactiveEmployees: 1, onLeaveEmployees: 1, probationEmployees: 1 }
    const calls = stubFetch(() => jsonResponse(200, { success: true, message: 'ok', data: summary }))
    const store = makeStore()
    const result = await store.dispatch(employeesApi.endpoints.getEmployeeSummary.initiate()).unwrap()
    expect(new URL(calls[0].url).pathname.endsWith('/dashboard/summary')).toBe(true)
    expect(result).toEqual(summary)
  })
})

describe('API failures', () => {
  it('404 on GET /employees/:id is detectable', async () => {
    stubFetch(() => jsonResponse(404, { statusCode: 404, message: 'Employee not found', error: 'Not Found' }))
    const store = makeStore()
    const result = await store.dispatch(employeesApi.endpoints.getEmployee.initiate('missing'))
    expect(result.isError).toBe(true)
    expect(isNotFoundError(result.error)).toBe(true)
    expect(getEmployeeErrorMessage(result.error, 'fallback')).toBe('Employee not found')
  })

  it('409 conflicts name the duplicated fields', async () => {
    stubFetch(() =>
      jsonResponse(409, { message: 'Employee with unique field(s) already exists', conflicts: ['employeeCode', 'pan'] }),
    )
    const store = makeStore()
    const { formData } = buildCreateFormData(validCreateForm(), validExtras())
    let caught: unknown
    try {
      await store.dispatch(employeesApi.endpoints.createEmployee.initiate(formData as FormData)).unwrap()
    } catch (error) {
      caught = error
    }
    expect(getEmployeeErrorMessage(caught, 'fallback')).toBe(
      'Employee with unique field(s) already exists: Employee code, PAN.',
    )
  })

  it('validation arrays and network errors become readable messages', async () => {
    stubFetch(() => jsonResponse(400, { statusCode: 400, message: ['phone too short', 'pan invalid'] }))
    const store = makeStore()
    const bad = await store.dispatch(
      employeesApi.endpoints.updateEmployee.initiate({ id: 'emp-uuid-1', body: { phone: '1' } }),
    )
    expect(getEmployeeErrorMessage(bad.error, 'fallback')).toBe('phone too short, pan invalid')

    vi.unstubAllGlobals()
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    const offline = await makeStore().dispatch(employeesApi.endpoints.listEmployees.initiate({}))
    expect(getEmployeeErrorMessage(offline.error, 'fallback')).toBe(
      'Unable to reach the server. Check your connection and try again.',
    )
  })
})

describe('permission restrictions', () => {
  it('maps employee actions to the verified permission codes', () => {
    expect(FEATURE_PERMISSION_MAP['employee.directory']).toBe('employees:read')
    expect(FEATURE_PERMISSION_MAP['employee.stats']).toBe('employees:read')
    expect(FEATURE_PERMISSION_MAP['employee.registration.view']).toBe('employees:read')
    expect(FEATURE_PERMISSION_MAP['employee.registration.edit']).toBe('employees:create')
    expect(FEATURE_PERMISSION_MAP['employee.manage']).toBe('employees:update')
    expect(FEATURE_PERMISSION_MAP['employee.delete']).toBe('employees:delete')
    expect(FEATURE_PERMISSION_MAP['employee.syncDevice']).toBe('employees:sync_device')
  })

  it('denies each action without its permission, whatever the role', () => {
    const readOnly = ['employees:read']
    expect(canAccessFeature('employee.directory', 'HR_ADMIN', readOnly)).toBe(true)
    expect(canAccessFeature('employee.manage', 'HR_ADMIN', readOnly)).toBe(false)
    expect(canAccessFeature('employee.delete', 'SUPER_ADMIN', readOnly)).toBe(false)
    expect(canAccessFeature('employee.registration.edit', 'HR_ADMIN', readOnly)).toBe(false)
    expect(canAccessFeature('employee.syncDevice', 'HR_ADMIN', readOnly)).toBe(false)
    expect(canAccessFeature('employee.syncDevice', 'HR_ADMIN', ['employees:sync_device'])).toBe(true)
    expect(canAccessFeature('employee.directory', 'EMPLOYEE', [])).toBe(false)
  })

  it('the profile form marks the same unsupported fields the mappers refuse', () => {
    expect(UPDATE_UNSUPPORTED_FIELDS.has('designation')).toBe(true)
    expect(UPDATE_UNSUPPORTED_FIELDS.has('department')).toBe(true)
    expect(CREATE_UNSUPPORTED_FIELDS.has('designation')).toBe(false)
    expect(CREATE_UNSUPPORTED_FIELDS.has('department')).toBe(false)
    expect(UPDATE_UNSUPPORTED_FIELDS.has('firstName')).toBe(false)
  })

  it('create-login is gated by users:create', () => {
    expect(canAccessFeature('employee.createLogin', 'HR_ADMIN', ['users:create'])).toBe(true)
    expect(canAccessFeature('employee.createLogin', 'HR_ADMIN', ['employees:create'])).toBe(false)
  })
})

describe('loading / empty / error view state', () => {
  it('derives the state to render', () => {
    expect(getQueryViewState({ isLoading: true, isError: false, hasData: false })).toBe('loading')
    expect(getQueryViewState({ isLoading: false, isError: true, hasData: false })).toBe('error')
    expect(getQueryViewState({ isLoading: false, isError: false, hasData: true, itemCount: 0 })).toBe('empty')
    expect(getQueryViewState({ isLoading: false, isError: false, hasData: true, itemCount: 3 })).toBe('ready')
  })

  it('keeps showing data when a background refetch fails', () => {
    expect(getQueryViewState({ isLoading: false, isError: true, hasData: true, itemCount: 2 })).toBe('ready')
  })
})
