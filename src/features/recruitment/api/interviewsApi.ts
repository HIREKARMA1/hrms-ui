/**
 * RTK Query client for recruitment interviews (`/recruitment/interviews`).
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
  AssignInterviewersBody,
  BackendInterview,
  CreateInterviewBody,
  CreateInterviewFeedbackBody,
  InterviewFeedbackItem,
  InterviewRecommendation,
  InterviewsPage,
  ListInterviewsArgs,
  UpdateInterviewBody,
} from './interviewsApi.types'

export { RECRUITMENT_PAGE_SIZE as INTERVIEWS_PAGE_SIZE }

const LIST_TAG = { type: 'RecruitmentInterview' as const, id: 'LIST' }

const RECOMMENDATIONS = new Set<InterviewRecommendation>(['PASS', 'FAIL', 'HOLD'])

function listParams(args: ListInterviewsArgs) {
  const params: Record<string, string | number> = {
    page: clampRecruitmentPage(args.page),
    limit: clampRecruitmentLimit(args.limit),
  }
  const search = args.search?.trim()
  if (search) params.search = search.slice(0, 200)
  if (args.candidateId?.trim()) params.candidateId = args.candidateId.trim()
  if (args.jobPostingId?.trim()) params.jobPostingId = args.jobPostingId.trim()
  if (args.applicationId?.trim()) params.applicationId = args.applicationId.trim()
  if (args.status?.trim()) params.status = args.status.trim()
  if (args.from?.trim()) params.from = args.from.trim()
  if (args.to?.trim()) params.to = args.to.trim()
  return params
}

function readStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string')
}

export function normalizeInterview(raw: unknown): BackendInterview | null {
  const row = asRecord(raw)
  if (!row) return null
  const id = readString(row.id)
  if (!id) return null

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
    round: readString(row.round) ?? readString(row.interviewRound),
    scheduledAt:
      readString(row.scheduledAt) ?? readString(row.startAt) ?? readString(row.date),
    endAt: readString(row.endAt) ?? readString(row.endTime),
    location: row.location === null ? null : readString(row.location),
    meetingLink: row.meetingLink === null ? null : readString(row.meetingLink),
    status: readString(row.status),
    interviewerIds: readStringArray(row.interviewerIds ?? row.employeeIds),
    interviewerNames: readStringArray(row.interviewerNames ?? row.interviewers),
    notes: row.notes === null ? null : readString(row.notes),
    createdAt: readString(row.createdAt),
    updatedAt: readString(row.updatedAt),
  }
}

export function normalizeInterviewsPage(raw: unknown): InterviewsPage {
  const data = asRecord(unwrapRecruitmentData(raw)) ?? asRecord(raw)
  const itemsRaw = data?.items
  const items = Array.isArray(itemsRaw)
    ? itemsRaw
        .map((item) => normalizeInterview(item))
        .filter((item): item is BackendInterview => item !== null)
    : []
  return {
    items,
    pagination: normalizeRecruitmentPagination(data?.pagination, items.length),
  }
}

function normalizeInterviewEnvelope(raw: unknown): BackendInterview {
  const interview = normalizeInterview(unwrapRecruitmentData(raw))
  if (!interview) throw new Error('Invalid interview response from server.')
  return interview
}

function normalizeFeedbackItem(raw: unknown): InterviewFeedbackItem | null {
  const row = asRecord(raw)
  if (!row) return null
  const recommendation = readString(row.recommendation)
  return {
    id: readString(row.id),
    interviewId: readString(row.interviewId),
    interviewerId: readString(row.interviewerId),
    interviewerName:
      readString(row.interviewerName) ?? readString(row.interviewer) ?? null,
    recommendation:
      recommendation && RECOMMENDATIONS.has(recommendation as InterviewRecommendation)
        ? (recommendation as InterviewRecommendation)
        : null,
    comments: row.comments === null ? null : readString(row.comments),
    technicalRating:
      row.technicalRating === undefined ? null : readNumber(row.technicalRating),
    communicationRating:
      row.communicationRating === undefined ? null : readNumber(row.communicationRating),
    createdAt: readString(row.createdAt),
  }
}

function normalizeFeedbackList(raw: unknown): InterviewFeedbackItem[] {
  const data = unwrapRecruitmentData(raw)
  const list = Array.isArray(data)
    ? data
  : Array.isArray(asRecord(data)?.items)
    ? (asRecord(data)!.items as unknown[])
    : []
  return list
    .map((item) => normalizeFeedbackItem(item))
    .filter((item): item is InterviewFeedbackItem => item !== null)
}

function pageTags(page: InterviewsPage | undefined) {
  return [
    LIST_TAG,
    ...(page?.items ?? []).map((item) => ({
      type: 'RecruitmentInterview' as const,
      id: item.id,
    })),
  ]
}

export function getInterviewErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const interviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listInterviews: build.query<InterviewsPage, ListInterviewsArgs | void>({
      query: (args = {}) => ({
        url: '/recruitment/interviews',
        params: listParams(args ?? {}),
      }),
      transformResponse: (response: unknown) => normalizeInterviewsPage(response),
      providesTags: (result) => pageTags(result),
    }),

    getInterview: build.query<BackendInterview, string>({
      query: (id) => `/recruitment/interviews/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeInterviewEnvelope(response),
      providesTags: (_result, _error, id) => [{ type: 'RecruitmentInterview', id }],
    }),

    createInterview: build.mutation<BackendInterview, CreateInterviewBody>({
      query: (body) => ({
        url: '/recruitment/interviews',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeInterviewEnvelope(response),
      invalidatesTags: [LIST_TAG, { type: 'RecruitmentAnalytics', id: 'LIST' }],
    }),

    updateInterview: build.mutation<
      BackendInterview,
      { id: string; body: UpdateInterviewBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/interviews/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeInterviewEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentInterview', id },
        LIST_TAG,
      ],
    }),

    assignInterviewers: build.mutation<
      BackendInterview,
      { id: string; body: AssignInterviewersBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/interviews/${encodeURIComponent(id)}/interviewers`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeInterviewEnvelope(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentInterview', id },
        LIST_TAG,
      ],
    }),

    listInterviewFeedback: build.query<InterviewFeedbackItem[], string>({
      query: (id) => `/recruitment/interviews/${encodeURIComponent(id)}/feedback`,
      transformResponse: (response: unknown) => normalizeFeedbackList(response),
      providesTags: (_result, _error, id) => [
        { type: 'RecruitmentInterview', id: `${id}-feedback` },
      ],
    }),

    submitInterviewFeedback: build.mutation<
      InterviewFeedbackItem,
      { id: string; body: CreateInterviewFeedbackBody }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/interviews/${encodeURIComponent(id)}/feedback`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const item = normalizeFeedbackItem(unwrapRecruitmentData(response))
        if (!item) throw new Error('Invalid feedback response from server.')
        return item
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecruitmentInterview', id: `${id}-feedback` },
        { type: 'RecruitmentInterview', id },
      ],
    }),
  }),
})

export const {
  useListInterviewsQuery,
  useGetInterviewQuery,
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
  useAssignInterviewersMutation,
  useListInterviewFeedbackQuery,
  useSubmitInterviewFeedbackMutation,
} = interviewsApi