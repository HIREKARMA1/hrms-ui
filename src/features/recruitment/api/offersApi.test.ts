import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authReducer } from '@/features/auth/store/authSlice'
import { baseApi, setSessionEnding } from '@/services/api/baseApi'

import { offersApi, normalizeOffer } from './offersApi'

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

describe('offersApi', () => {
  it('lists offers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          envelope({
            items: [
              {
                id: 'off-1',
                status: 'RELEASED',
                candidateId: 'c1',
              },
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
          }),
        ),
      ),
    )
    const store = makeStore()
    const page = await store.dispatch(offersApi.endpoints.listOffers.initiate()).unwrap()
    expect(page.items[0]?.status).toBe('RELEASED')
  })

  it('normalize requires RELEASED|ACCEPTED|…', () => {
    expect(normalizeOffer({ id: '1', status: 'DRAFT' })).toBeNull()
  })
})