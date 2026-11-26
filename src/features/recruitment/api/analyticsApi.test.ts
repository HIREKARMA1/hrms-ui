import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { analyticsApi, normalizePipeline, normalizeAnalyticsSummary } from './analyticsApi'

function envelope<T>(data: T) {
  return { success: true as const, message: 'ok', data }
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
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
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
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

describe('analyticsApi', () => {
  it('fetches overview metrics', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(envelope({ openJobs: 3, totalCandidates: 10, totalApplications: 12 })),
      ),
    )
    const store = makeStore()
    const data = await store.dispatch(analyticsApi.endpoints.getDashboardOverview.initiate()).unwrap()
    expect(data.openJobs).toBe(3)
  })

  it('normalizes pipeline stages', () => {
    const pipeline = normalizePipeline(
      envelope({
        stages: [
          { status: 'APPLIED', count: 2 },
          { status: 'SCREENING', count: 1 },
        ],
      }),
    )
    expect(pipeline.stages).toHaveLength(2)
    expect(normalizeAnalyticsSummary(envelope({ joined: 4 })).joined).toBe(4)
  })
})