/**
 * RTK Query client for recruitment analytics & dashboard endpoints.
 */
import { baseApi } from '@/services/api/baseApi'
import { getApiErrorMessage } from '@/services/api/errors'

import { APPLICATION_STATUSES } from './applicationsApi.types'
import {
  asRecord,
  readNumber,
  readString,
  unwrapRecruitmentData,
} from './recruitmentApiNormalize'
import type {
  DashboardActivityRow,
  DashboardApplicationRow,
  DashboardInterviewRow,
  RecruitmentAnalyticsSummary,
  RecruitmentDashboardOverview,
  RecruitmentPipeline,
} from './analyticsApi.types'

const ANALYTICS_TAG = { type: 'RecruitmentAnalytics' as const, id: 'LIST' }

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function readMetric(row: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = readNumber(row[key])
    if (value !== null) return value
  }
  return fallback
}

export function normalizeAnalyticsSummary(raw: unknown): RecruitmentAnalyticsSummary {
  const row = asRecord(unwrapRecruitmentData(raw)) ?? {}
  return {
    openJobs: readMetric(row, ['openJobs', 'totalOpenJobs', 'publishedJobs']),
    totalCandidates: readMetric(row, ['totalCandidates', 'candidates']),
    totalApplications: readMetric(row, ['totalApplications', 'applications']),
    shortlisted: readMetric(row, ['shortlisted', 'candidatesShortlisted']),
    interviewsScheduled: readMetric(row, ['interviewsScheduled', 'scheduledInterviews']),
    offersReleased: readMetric(row, ['offersReleased', 'releasedOffers']),
    joined: readMetric(row, ['joined', 'candidatesJoined']),
    pendingOffers: readMetric(row, ['pendingOffers', 'offersPending']),
    conversionRate:
      row.conversionRate === undefined
        ? readNumber(row.conversion)
        : readNumber(row.conversionRate),
    avgTimeToHireDays:
      row.avgTimeToHireDays === undefined
        ? readNumber(row.avgTimeToHire)
        : readNumber(row.avgTimeToHireDays),
    raw: row,
  }
}

export function normalizePipeline(raw: unknown): RecruitmentPipeline {
  const row = asRecord(unwrapRecruitmentData(raw)) ?? {}
  const stagesRaw = row.stages ?? row.items ?? row.counts
  const stages: RecruitmentPipeline['stages'] = []

  if (Array.isArray(stagesRaw)) {
    for (const entry of stagesRaw) {
      const e = asRecord(entry) ?? {}
      const status = readString(e.status) ?? readString(e.stage) ?? ''
      if (!status) continue
      stages.push({
        status,
        count: readNumber(e.count) ?? 0,
        label: readString(e.label) ?? formatStatusLabel(status),
      })
    }
  } else {
    for (const status of APPLICATION_STATUSES) {
      const count = readNumber(row[status]) ?? readNumber(row[status.toLowerCase()])
      if (count !== null) {
        stages.push({ status, count, label: formatStatusLabel(status) })
      }
    }
  }

  const total =
    readNumber(row.total) ?? stages.reduce((sum, stage) => sum + stage.count, 0)
  return { stages, total }
}

function normalizeDashboardApplications(raw: unknown): DashboardApplicationRow[] {
  const data = unwrapRecruitmentData(raw)
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)!.items as unknown[])
      : []
  return list.map((entry) => {
    const row = asRecord(entry) ?? {}
    return {
      id: readString(row.id) ?? '',
      candidateName:
        readString(row.candidateName) ?? readString(row.fullName) ?? null,
      jobTitle: readString(row.jobTitle) ?? null,
      status: readString(row.status),
      appliedAt: readString(row.appliedAt) ?? readString(row.createdAt),
    }
  })
}

function normalizeDashboardInterviews(raw: unknown): DashboardInterviewRow[] {
  const data = unwrapRecruitmentData(raw)
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)!.items as unknown[])
      : []
  return list.map((entry) => {
    const row = asRecord(entry) ?? {}
    return {
      id: readString(row.id) ?? '',
      candidateName: readString(row.candidateName) ?? null,
      jobTitle: readString(row.jobTitle) ?? null,
      round: readString(row.round) ?? null,
      scheduledAt:
        readString(row.scheduledAt) ?? readString(row.date) ?? readString(row.startAt),
    }
  })
}

function normalizeDashboardActivities(raw: unknown): DashboardActivityRow[] {
  const data = unwrapRecruitmentData(raw)
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)!.items as unknown[])
      : []
  return list.map((entry) => {
    const row = asRecord(entry) ?? {}
    return {
      id: readString(row.id) ?? '',
      text:
        readString(row.text) ??
        readString(row.message) ??
        readString(row.description) ??
        '',
      occurredAt:
        readString(row.occurredAt) ??
        readString(row.time) ??
        readString(row.createdAt),
    }
  })
}

export function getRecruitmentAnalyticsErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback)
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRecruitmentAnalytics: build.query<RecruitmentAnalyticsSummary, void>({
      query: () => '/recruitment/analytics',
      transformResponse: (response: unknown) => normalizeAnalyticsSummary(response),
      providesTags: [ANALYTICS_TAG],
    }),

    getRecruitmentPipeline: build.query<RecruitmentPipeline, void>({
      query: () => '/recruitment/pipeline',
      transformResponse: (response: unknown) => normalizePipeline(response),
      providesTags: [ANALYTICS_TAG],
    }),

    getDashboardOverview: build.query<RecruitmentDashboardOverview, void>({
      query: () => '/recruitment/dashboard/overview',
      transformResponse: (response: unknown) => normalizeAnalyticsSummary(response),
      providesTags: [ANALYTICS_TAG],
    }),

    getRecentApplications: build.query<DashboardApplicationRow[], void>({
      query: () => '/recruitment/dashboard/recent-applications',
      transformResponse: (response: unknown) => normalizeDashboardApplications(response),
      providesTags: [ANALYTICS_TAG],
    }),

    getUpcomingInterviews: build.query<DashboardInterviewRow[], void>({
      query: () => '/recruitment/dashboard/upcoming-interviews',
      transformResponse: (response: unknown) => normalizeDashboardInterviews(response),
      providesTags: [ANALYTICS_TAG],
    }),

    getDashboardActivities: build.query<DashboardActivityRow[], void>({
      query: () => '/recruitment/dashboard/activities',
      transformResponse: (response: unknown) => normalizeDashboardActivities(response),
      providesTags: [ANALYTICS_TAG],
    }),
  }),
})

export const {
  useGetRecruitmentAnalyticsQuery,
  useGetRecruitmentPipelineQuery,
  useGetDashboardOverviewQuery,
  useGetRecentApplicationsQuery,
  useGetUpcomingInterviewsQuery,
  useGetDashboardActivitiesQuery,
} = analyticsApi