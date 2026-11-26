import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { interviewsApi } from './interviewsApi'

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
  setSessionEnding(false)
})

describe('interviewsApi', () => {
  it('submits feedback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          envelope({
            id: 'fb-1',
            interviewId: 'int-1',
            recommendation: 'PASS',
          }),
        ),
      ),
    )
    const store = makeStore()
    const item = await store
      .dispatch(
        interviewsApi.endpoints.submitInterviewFeedback.initiate({
          id: 'int-1',
          body: { recommendation: 'PASS' },
        }),
      )
      .unwrap()
    expect(item.recommendation).toBe('PASS')
  })
})