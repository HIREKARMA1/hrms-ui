/**
 * RTK Query client for `/organisation-onboarding`.
 */
import { baseApi } from '@/services/api/baseApi'
import { unwrapData, type ApiResponse } from '@/services/api/types'

import type {
  CreateOnboardingAccountBody,
  CreateOnboardingAccountResult,
  ListOnboardingsArgs,
  OnboardingFormLoginBody,
  OnboardingFormLoginResult,
  OnboardingUploadResult,
  OnboardingsPage,
  OrganisationOnboarding,
  SubmitOnboardingFormBody,
  VerifyOnboardingBody,
  VerifyOnboardingResult,
} from './organisationOnboardingApi.types'

function cleanListParams(args: ListOnboardingsArgs = {}) {
  const params: Record<string, string | number> = {}
  if (args.status) params.status = args.status
  if (args.skip !== undefined) params.skip = args.skip
  if (args.take !== undefined) params.take = args.take
  return params
}

export const organisationOnboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listOrganisationOnboardings: build.query<OnboardingsPage, ListOnboardingsArgs | void>({
      query: (args) => ({
        url: '/organisation-onboarding',
        params: cleanListParams(args ?? {}),
      }),
      transformResponse: (response: ApiResponse<OnboardingsPage>) => unwrapData(response),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((row) => ({
                type: 'OrganisationOnboarding' as const,
                id: row.id,
              })),
              { type: 'OrganisationOnboarding' as const, id: 'LIST' },
            ]
          : [{ type: 'OrganisationOnboarding' as const, id: 'LIST' }],
    }),

    getOrganisationOnboarding: build.query<OrganisationOnboarding, string>({
      query: (id) => `/organisation-onboarding/${encodeURIComponent(id.trim())}`,
      transformResponse: (response: ApiResponse<OrganisationOnboarding>) =>
        unwrapData(response),
      providesTags: (_result, _error, id) => [
        { type: 'OrganisationOnboarding', id },
      ],
    }),

    createOrganisationOnboardingAccount: build.mutation<
      CreateOnboardingAccountResult,
      CreateOnboardingAccountBody
    >({
      query: (body) => ({
        url: '/organisation-onboarding/accounts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CreateOnboardingAccountResult>) =>
        unwrapData(response),
      invalidatesTags: [{ type: 'OrganisationOnboarding', id: 'LIST' }],
    }),

    loginOrganisationOnboardingForm: build.mutation<
      OnboardingFormLoginResult,
      { onboardingId: string; body: OnboardingFormLoginBody }
    >({
      query: ({ onboardingId, body }) => ({
        url: `/organisation-onboarding/forms/${encodeURIComponent(onboardingId)}/login`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<OnboardingFormLoginResult>) =>
        unwrapData(response),
    }),

    submitOrganisationOnboardingForm: build.mutation<
      OrganisationOnboarding,
      { onboardingId: string; body: SubmitOnboardingFormBody }
    >({
      query: ({ onboardingId, body }) => ({
        url: `/organisation-onboarding/forms/${encodeURIComponent(onboardingId)}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<OrganisationOnboarding>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'OrganisationOnboarding', id: arg.onboardingId },
        { type: 'OrganisationOnboarding', id: 'LIST' },
      ],
    }),

    uploadOrganisationOnboardingFile: build.mutation<
      OnboardingUploadResult,
      {
        onboardingId: string
        email: string
        password: string
        file: File
        folder?: string
      }
    >({
      query: ({ onboardingId, email, password, file, folder }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('email', email)
        formData.append('password', password)
        if (folder) formData.append('folder', folder)
        return {
          url: `/organisation-onboarding/forms/${encodeURIComponent(onboardingId)}/uploads`,
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: ApiResponse<OnboardingUploadResult>) =>
        unwrapData(response),
    }),

    verifyOrganisationOnboarding: build.mutation<
      VerifyOnboardingResult,
      { id: string; body: VerifyOnboardingBody }
    >({
      query: ({ id, body }) => ({
        url: `/organisation-onboarding/${encodeURIComponent(id)}/verify`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<VerifyOnboardingResult>) =>
        unwrapData(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'OrganisationOnboarding', id: arg.id },
        { type: 'OrganisationOnboarding', id: 'LIST' },
        'Employee',
      ],
    }),
  }),
})

export const {
  useListOrganisationOnboardingsQuery,
  useGetOrganisationOnboardingQuery,
  useCreateOrganisationOnboardingAccountMutation,
  useLoginOrganisationOnboardingFormMutation,
  useSubmitOrganisationOnboardingFormMutation,
  useUploadOrganisationOnboardingFileMutation,
  useVerifyOrganisationOnboardingMutation,
} = organisationOnboardingApi
