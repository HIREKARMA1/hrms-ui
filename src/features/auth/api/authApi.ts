import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type { LoginRequest, LoginResponseData } from '../types/auth.types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponseData, LoginRequest>({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
      transformResponse: (response: ApiResponse<LoginResponseData>) =>
        unwrapData(response),
    }),
  }),
})

export const { useLoginMutation } = authApi
