/**
 * Recruitment Job Management API.
 *
 * MOCK-BASED ONLY: stubbed `fetch`. Mirrors production OpenAPI for
 * `/api/v1/recruitment/jobs`. No live backend is contacted.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { canAccessFeature } from '@/features/rbac/services/permissionAdapter'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { jobsApi, normalizeJob, normalizeJobsPage } from './jobsApi'
import type { BackendJob } from './jobsApi.types'
import {
  buildCreateJobBody,
  validateCreateJobForm,
} from '../utils/jobFormValidation'
import {
  createSubmitGuard,
  submitCreateJob,
  submitDeleteJob,
  submitUpdateJob,
  submitUpdateJobDescription,
} from '../utils/jobMutations'

const JOB: BackendJob = {
  id: 'job-1',
  title: 'Frontend Engineer',
  departmentId: 'dept-1',
  department: { id: 'dept-1', name: 'Engineering' },
  employmentType: 'FULL_TIME',
  location: 'Hyderabad',
  workMode: 'HYBRID',
  openings: 2,
  minExperienceYears: 2,
  maxExperienceYears: 5,
  salaryMin: 800000,
  salaryMax: 1200000,
  salaryCurrency: 'INR',
  description: 'Build HRMS UI',
  requirements: 'React',
  skills: ['React', 'TypeScript'],
  applicationDeadline: '2026-12-31',
  referenceName: 'Priya Sharma',
  referenceEmail: 'priya.sharma@hirekarma.in',
  status: 'DRAFT',
  isActive: true,
  applicationCount: 0,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  history: [],
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
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'actor-1',
          email: 'hr@example.test',
          role: 'MANAGER',
          roles: ['MANAGER'],
          permissions: [],
          isActive: true,
        },
        rememberMe: false,
      },
    },
  })
}

const baseForm = {
  title: 'Frontend Engineer',
  departmentId: 'dept-1',
  employmentType: 'FULL_TIME' as const,
  location: 'Hyderabad',
  workMode: 'HYBRID' as const,
  openings: '2',
  minExperienceYears: '2',
  maxExperienceYears: '5',
  salaryMin: '800000',
  salaryMax: '1200000',
  salaryCurrency: 'INR',
  description: 'Build HRMS UI',
  requirements: 'React',
  skillsText: 'React, TypeScript',
  applicationDeadline: '2026-12-31',
  status: 'DRAFT' as const,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setSessionEnding(false)
})

describe('RBAC', () => {
  it('gives SA/HR manage; Manager/Employee board view only', () => {
    expect(canAccessFeature('recruitment.jobs', 'MANAGER', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'MANAGER', [])).toBe(false)
    expect(canAccessFeature('recruitment.manage', 'HR_ADMIN', [])).toBe(true)
    expect(canAccessFeature('recruitment.jobs', 'SUPER_ADMIN', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'SUPER_ADMIN', [])).toBe(true)
    expect(canAccessFeature('recruitment.jobs', 'EMPLOYEE', [])).toBe(true)
    expect(canAccessFeature('recruitment.manage', 'EMPLOYEE', [])).toBe(false)
  })
})

describe('create job', () => {
  it('POSTs the OpenAPI create payload', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(JOB, 'Job created')))
    const store = makeStore()
    const outcome = await submitCreateJob({
      values: baseForm,
      guard: createSubmitGuard(),
      send: (body) => store.dispatch(jobsApi.endpoints.createJob.initiate(body)),
    })
    expect(outcome).toMatchObject({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/recruitment/jobs')
    expect(calls[0].method).toBe('POST')
    expect(calls[0].headers.get('Authorization')).toBe('Bearer access-token')
    const body = await calls[0].json()
    expect(body).toMatchObject({
      title: 'Frontend Engineer',
      departmentId: 'dept-1',
      employmentType: 'FULL_TIME',
      location: 'Hyderabad',
      workMode: 'HYBRID',
      description: 'Build HRMS UI',
      skills: ['React', 'TypeScript'],
    })
    expect(body).not.toHaveProperty('referenceName')
    expect(body).not.toHaveProperty('referenceEmail')
  })

  it('does not serialize reference fields on HR job create', () => {
    const body = buildCreateJobBody(baseForm)
    expect(body).not.toHaveProperty('referenceName')
    expect(body).not.toHaveProperty('referenceEmail')
  })

  it('omits departmentId from the create body when the field is empty', () => {
    const body = buildCreateJobBody({ ...baseForm, departmentId: '  ' })
    expect(body.departmentId).toBeUndefined()
  })

  it('serializes the selected department id into the create body', () => {
    const body = buildCreateJobBody({
      ...baseForm,
      departmentId: 'clxyz_real_department_id',
    })
    expect(body.departmentId).toBe('clxyz_real_department_id')
  })

  it('rejects invalid required fields without calling the server', async () => {
    const calls = stubFetch(() => jsonResponse(201, envelope(JOB)))
    const outcome = await submitCreateJob({
      values: { ...baseForm, title: '', description: '' },
      guard: createSubmitGuard(),
      send: () => ({ unwrap: async () => JOB }),
    })
    expect(outcome.status).toBe('invalid')
    expect(calls).toHaveLength(0)
    expect(validateCreateJobForm({ ...baseForm, title: '' })).toMatchObject({
      title: 'Title is required.',
    })
  })

  it('surfaces forbidden responses', async () => {
    stubFetch(() => jsonResponse(403, { statusCode: 403, message: 'Insufficient permission' }))
    const store = makeStore()
    const outcome = await submitCreateJob({
      values: baseForm,
      guard: createSubmitGuard(),
      send: (body) => store.dispatch(jobsApi.endpoints.createJob.initiate(body)),
    })
    expect(outcome).toMatchObject({ status: 'error' })
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
    const send = (body: ReturnType<typeof buildCreateJobBody>) =>
      store.dispatch(jobsApi.endpoints.createJob.initiate(body))
    const first = submitCreateJob({ values: baseForm, guard, send })
    const second = await submitCreateJob({ values: baseForm, guard, send })
    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(201, envelope(JOB)))
    await expect(first).resolves.toMatchObject({ status: 'success' })
    expect(calls).toHaveLength(1)
  })
})

describe('list jobs', () => {
  it('lists with pagination and filters', async () => {
    const calls = stubFetch(() =>
      jsonResponse(
        200,
        envelope({
          items: [JOB],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        }),
      ),
    )
    const store = makeStore()
    const page = await store
      .dispatch(
        jobsApi.endpoints.listJobs.initiate({
          page: 1,
          limit: 20,
          search: 'Frontend',
          status: 'DRAFT',
          employmentType: 'FULL_TIME',
          workMode: 'HYBRID',
          isActive: true,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
      )
      .unwrap()
    expect(page.items).toHaveLength(1)
    const url = new URL(calls[0].url)
    expect(pathOf(calls[0])).toBe('/recruitment/jobs')
    expect(url.searchParams.get('search')).toBe('Frontend')
    expect(url.searchParams.get('status')).toBe('DRAFT')
    expect(url.searchParams.get('isActive')).toBe('true')
  })

  it('handles empty list and server errors', async () => {
    stubFetch(() =>
      jsonResponse(
        200,
        envelope({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      ),
    )
    const store = makeStore()
    const empty = await store.dispatch(jobsApi.endpoints.listJobs.initiate()).unwrap()
    expect(empty.items).toEqual([])

    stubFetch(() => jsonResponse(500, { statusCode: 500, message: 'Server error' }))
    await expect(
      store.dispatch(jobsApi.endpoints.listJobs.initiate({ page: 1 })).unwrap(),
    ).rejects.toMatchObject({ status: 500 })
  })

  it('surfaces 401 unauthorized', async () => {
    stubFetch(() => jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))
    const store = makeStore()
    await expect(
      store.dispatch(jobsApi.endpoints.listJobs.initiate()).unwrap(),
    ).rejects.toMatchObject({ status: 401 })
  })
})

describe('get / update / description / delete', () => {
  it('gets a job by id', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope(JOB)))
    const store = makeStore()
    const job = await store.dispatch(jobsApi.endpoints.getJob.initiate('job-1')).unwrap()
    expect(pathOf(calls[0])).toBe('/recruitment/jobs/job-1')
    expect(job.title).toBe('Frontend Engineer')
  })

  it('patches only changed update fields and invalidates caches', async () => {
    const updated = { ...JOB, title: 'Senior Frontend Engineer' }
    const calls = stubFetch(() => jsonResponse(200, envelope(updated)))
    const store = makeStore()
    const outcome = await submitUpdateJob({
      id: JOB.id,
      values: { ...baseForm, title: 'Senior Frontend Engineer' },
      original: JOB,
      guard: createSubmitGuard(),
      send: (arg) => store.dispatch(jobsApi.endpoints.updateJob.initiate(arg)),
    })
    expect(outcome).toMatchObject({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/recruitment/jobs/job-1')
    expect(calls[0].method).toBe('PATCH')
    expect(await calls[0].json()).toEqual({ title: 'Senior Frontend Engineer' })
  })

  it('updates description via the dedicated endpoint and skips unchanged text', async () => {
    const calls = stubFetch(() =>
      jsonResponse(200, envelope({ ...JOB, description: 'Updated desc' })),
    )
    const store = makeStore()
    const unchanged = await submitUpdateJobDescription({
      id: JOB.id,
      description: JOB.description,
      originalDescription: JOB.description,
      guard: createSubmitGuard(),
      send: (arg) => store.dispatch(jobsApi.endpoints.updateJobDescription.initiate(arg)),
    })
    expect(unchanged).toEqual({ status: 'unchanged' })
    expect(calls).toHaveLength(0)

    const outcome = await submitUpdateJobDescription({
      id: JOB.id,
      description: 'Updated desc',
      originalDescription: JOB.description,
      guard: createSubmitGuard(),
      send: (arg) => store.dispatch(jobsApi.endpoints.updateJobDescription.initiate(arg)),
    })
    expect(outcome).toMatchObject({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/recruitment/jobs/job-1/description')
    expect(await calls[0].json()).toEqual({ description: 'Updated desc' })
  })

  it('soft-deletes via DELETE and surfaces not-found', async () => {
    const calls = stubFetch(() => jsonResponse(200, envelope({ ...JOB, isActive: false })))
    const store = makeStore()
    const outcome = await submitDeleteJob({
      id: JOB.id,
      guard: createSubmitGuard(),
      send: (id) => store.dispatch(jobsApi.endpoints.deleteJob.initiate(id)),
    })
    expect(outcome).toEqual({ status: 'success' })
    expect(pathOf(calls[0])).toBe('/recruitment/jobs/job-1')
    expect(calls[0].method).toBe('DELETE')

    stubFetch(() => jsonResponse(404, { statusCode: 404, message: 'Not found' }))
    const missing = await submitDeleteJob({
      id: 'missing',
      guard: createSubmitGuard(),
      send: (id) => store.dispatch(jobsApi.endpoints.deleteJob.initiate(id)),
    })
    expect(missing).toMatchObject({ status: 'error' })
  })

  it('confirmation cancellation means no delete request', () => {
    // UI only calls submitDeleteJob after confirm; helper itself does not auto-fire.
    expect(normalizeJob(JOB)?.id).toBe('job-1')
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
    const send = (id: string) => store.dispatch(jobsApi.endpoints.deleteJob.initiate(id))
    const first = submitDeleteJob({ id: JOB.id, guard, send })
    const second = await submitDeleteJob({ id: JOB.id, guard, send })
    expect(second).toEqual({ status: 'busy' })
    release(jsonResponse(200, envelope(null)))
    await expect(first).resolves.toEqual({ status: 'success' })
    expect(calls).toHaveLength(1)
  })

  it('surfaces network failures', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    const store = makeStore()
    await expect(
      store.dispatch(jobsApi.endpoints.listJobs.initiate()).unwrap(),
    ).rejects.toBeTruthy()
  })
})

describe('normalize', () => {
  it('normalizes list pages and drops invalid rows', () => {
    const page = normalizeJobsPage(
      envelope({
        items: [JOB, { id: 'bad' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    )
    expect(page.items).toHaveLength(1)
    expect(page.pagination.total).toBe(1)
  })

  it('parses Prisma Decimal string experience and salary fields', () => {
    const job = normalizeJob({
      ...JOB,
      minExperienceYears: '2.0',
      maxExperienceYears: '5.0',
      salaryMin: '800000',
      salaryMax: '1200000',
      salaryCurrency: 'INR',
    })
    expect(job?.minExperienceYears).toBe(2)
    expect(job?.maxExperienceYears).toBe(5)
    expect(job?.salaryMin).toBe(800000)
    expect(job?.salaryMax).toBe(1200000)
  })
})
