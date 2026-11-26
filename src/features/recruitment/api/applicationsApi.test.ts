import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { applicationsApi, normalizeApplication } from './applicationsApi'

function envelope<T>(data: T) {
  return { success: true as const, message: 'ok', data }
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (g) => g().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        accessToken: 'token',
        refreshToken: 'r',
        user: {
          id: '1',
          email: 'hr@example.test',
          role: 'HR_ADMIN',
          roles: ['HR_ADMIN'],
          permissions: [],
          isActive: true,
        },
        rememberMe: false,
      },
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  setSessionEnding(false)
})

describe('applicationsApi', () => {
  it('lists applications', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          200,
          envelope({
            items: [
              {
                id: 'app-1',
                jobPostingId: 'job-1',
                candidateId: 'can-1',
                status: 'APPLIED',
              },
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
          }),
        ),
      ),
    )
    const store = makeStore()
    const page = await store.dispatch(applicationsApi.endpoints.listApplications.initiate()).unwrap()
    expect(page.items[0]?.status).toBe('APPLIED')
  })

  it('patches status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const request = input instanceof Request ? input : new Request(input, init)
        expect(request.method).toBe('PATCH')
        return jsonResponse(
          200,
          envelope({
            id: 'app-1',
            jobPostingId: 'job-1',
            candidateId: 'can-1',
            status: 'SCREENING',
          }),
        )
      }),
    )
    const store = makeStore()
    const updated = await store
      .dispatch(
        applicationsApi.endpoints.updateApplicationStatus.initiate({
          id: 'app-1',
          body: { status: 'SCREENING' },
        }),
      )
      .unwrap()
    expect(updated.status).toBe('SCREENING')
  })

  it('normalize defaults unknown status to APPLIED', () => {
    expect(
      normalizeApplication({
        id: '1',
        jobPostingId: 'j',
        candidateId: 'c',
        status: 'NOT_REAL',
      })?.status,
    ).toBe('APPLIED')
  })
})