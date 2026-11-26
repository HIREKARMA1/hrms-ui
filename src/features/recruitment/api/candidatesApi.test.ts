/**
 * MOCK-BASED ONLY: stubbed fetch for `/recruitment/candidates`.
 */
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { candidatesApi, normalizeCandidate } from './candidatesApi'
import type { BackendCandidate } from './candidatesApi.types'

const CANDIDATE: BackendCandidate = {
  id: 'can-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.test',
  phone: '+911234567890',
  location: 'London',
  experienceYears: 8,
  currentCompany: 'Analytical Engines',
  currentDesignation: 'Engineer',
  skills: ['Math'],
  source: 'LINKEDIN',
  isActive: true,
  resumes: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

function envelope<T>(data: T) {
  return { success: true as const, message: 'ok', data }
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

function stubFetch(handler: (request: Request) => Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      return handler(request)
    }),
  )
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
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 'u1',
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

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setSessionEnding(false)
})

describe('candidatesApi', () => {
  it('lists candidates with envelope', async () => {
    stubFetch(() =>
      jsonResponse(
        200,
        envelope({
          items: [CANDIDATE],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        }),
      ),
    )
    const store = makeStore()
    const page = await store.dispatch(candidatesApi.endpoints.listCandidates.initiate({})).unwrap()
    expect(page.items).toHaveLength(1)
  })

  it('creates a candidate', async () => {
    let seenPath = ''
    stubFetch((request) => {
      seenPath = pathOf(request)
      return jsonResponse(201, envelope(CANDIDATE))
    })
    const store = makeStore()
  await store
      .dispatch(
        candidatesApi.endpoints.createCandidate.initiate({
          fullName: 'Ada Lovelace',
          email: 'ada@example.test',
          phone: '+911234567890',
        }),
      )
      .unwrap()
    expect(seenPath).toBe('/recruitment/candidates')
  })

  it('normalizes invalid rows out', () => {
    expect(normalizeCandidate({ id: 'x' })).toBeNull()
    expect(normalizeCandidate(CANDIDATE)?.email).toBe('ada@example.test')
  })
})