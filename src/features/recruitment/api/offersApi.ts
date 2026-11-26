/**
 * RTK Query client for recruitment offers (`/recruitment/offers`).
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  asRecord,
  clampRecruitmentLimit,
  clampRecruitmentPage,
  normalizeRecruitmentPagination,
  readNumber,
  readString,
  RECRUITMENT_PAGE_SIZE,
  unwrapRecruitmentData,
} from './recruitmentApiNormalize'
import type {
  BackendOffer,
  CreateOfferBody,
  ListOffersArgs,
  OfferStatus,
  OffersPage,
  UpdateOfferStatusBody,
} from './offersApi.types'

export { RECRUITMENT_PAGE_SIZE as OFFERS_PAGE_SIZE }
export { OFFER_STATUSES } from './offersApi.types'
export type { OfferStatus, BackendOffer } from './offersApi.types'

const LIST_TAG = { type: 'RecruitmentOffer' as const, id: 'LIST' }

const STATUSES = new Set<OfferStatus>(['RELEASED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'])

function listParams(args: ListOffersArgs) {
  const params: Record<string, string | number> = {
    page: clampRecruitmentPage(args.page),
    limit: clampRecruitmentLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 200)
  if (args.status) params.status = args.status
  if (args.candidateId?.trim()) params.candidateId = args.candidateId.trim()
  if (args.jobPostingId?.trim()) params.jobPostingId = args.jobPostingId.trim()
  return params
}

export function normalizeOffer(raw: unknown): BackendOffer | null {
  const row = asRecord(raw)
  if (!row) return null

  const id = readString(row.id)
  const status = readString(row.status)
  if (!id || !status || !STATUSES.has(status as OfferStatus)) return null

  const candidate = asRecord(row.candidate)
  const job = asRecord(row.jobPosting) ?? asRecord(row.job)

  return {
    id,
    applicationId: readString(row.applicationId),
    candidateId: readString(row.candidateId) ?? readString(candidate?.id),
    jobPostingId: readString(row.jobPostingId) ?? readString(job?.id),
    candidateName:
      readString(row.candidateName) ?? readString(candidate?.fullName) ?? null,
    jobTitle: readString(row.jobTitle) ?? readString(job?.title) ?? null,
    offeredDesignation: readString(row.offeredDesignation) ?? readString(row.designation),
    department: row.department === null ? null : readString(row.department),
    salary: row.salary === undefined ? readNumber(row.offeredSalary) : readNumber(row.salary),
    salaryCurrency:
      row.salaryCurrency === null ? null : readString(row.salaryCurrency) ?? 'INR',
    joiningDate: readString(row.joiningDate),
    expiryDate: readString(row.expiryDate) ?? readString(row.offerExpiryDate),
    employmentType: row.employmentType === null ? null : readString(row.employmentType),
    status: status as OfferStatus,
    reason: row.reason === null ? null : readString(row.reason),
    offerLetterFileName:
      readString(row.offerLetterFileName) ?? readString(row.letterFileName),
    offerLetterUrl: readString(row.offerLetterUrl) ?? readString(row.letterUrl),
    createdAt: readString(row.createdAt),
    updatedAt: readString(row.updatedAt),
  }
}

export function normalizeOffersPage(raw: unknown): OffersPage {
  const data = asRecord(unwrapRecruitmentData(raw)) ?? asRecord(raw)
  const itemsRaw = data?.items
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((item) => normalizeOffer(item)).filter((item): item is BackendOffer => item !== null)
    : []
  return {
    items,
    pagination: normalizeRecruitmentPagination(data?.pagination, items.length),
  }
}

function normalizeOfferEnvelope(raw: unknown): BackendOffer {
  const offer = normalizeOffer(unwrapRecruitmentData(raw))
  if (!offer) throw new Error('Invalid offer response from server.')
  return offer
}

function pageTags(page: OffersPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({ type: 'RecruitmentOffer' as const, id: item.id })),
  ]
}

export function getOfferErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const offersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listOffers: build.query<OffersPage, ListOffersArgs | void>({
      query: (args = {}) => ({
        url: '/recruitment/offers',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizeOffersPage(response),
      providesTags: (result) => pageTags(result),
    }),

    getOffer: build.query<BackendOffer, string>({
      query: (id) => `/recruitment/offers/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeOfferEnvelope(response),
      providesTags: (_result, _error, id) => [{ type: 'RecruitmentOffer', id }],
    }),

    createOffer: build.mutation<BackendOffer, CreateOfferBody>({
      query: (body) => ({
        url: '/recruitment/offers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeOfferEnvelope(response),
      invalidatesTags: [LIST_TAG, { type: 'RecruitmentAnalytics', id: 'LIST' }],
    }),

    updateOfferStatus: build.mutation<BackendOffer, { id: string; body: UpdateOfferStatusBody }>({
      query: ({ id, body }) => ({
        url: `/recruitment/offers/${encodeURIComponent(id)}/status`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeOfferEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentOffer', id },
        LIST_TAG,
        { type: 'RecruitmentAnalytics', id: 'LIST' },
      ],
    }),

    uploadOfferLetter: build.mutation<BackendOffer, { id: string; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData()
        body.append('file', file)
        return {
          url: `/recruitment/offers/${encodeURIComponent(id)}/letter`,
          method: 'POST',
          body,
        }
      },
      transformResponse: (response: unknown) => normalizeOfferEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentOffer', id },
        LIST_TAG,
      ],
    }),
  }),
})

export const {
  useListOffersQuery,
  useGetOfferQuery,
  useCreateOfferMutation,
  useUpdateOfferStatusMutation,
  useUploadOfferLetterMutation,
} = offersApi