/**
 * Root RTK Query API.
 *
 * Feature convention: each module adds its endpoints in
 * `features/<name>/api/<name>Api.ts` via `baseApi.injectEndpoints({ ... })`
 * and exports the generated hooks (e.g. `useGetXQuery`, `useCreateXMutation`).
 * Unwrap the server envelope with `transformResponse: unwrapData`.
 */
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { env } from '@/config/env'
import type { RootState } from '@/app/store'

import { API_TAGS } from './apiTags'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/**
 * Pass-through for now. On a 401 this is where the `/auth/refresh` call and
 * request retry will be added during the login integration.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  return rawBaseQuery(args, api, extraOptions)
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: API_TAGS,
  endpoints: () => ({}),
})
