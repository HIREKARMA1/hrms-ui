/** Dashboard & analytics payloads for recruitment reporting endpoints. */

export type RecruitmentAnalyticsSummary = {
  openJobs: number
  totalCandidates: number
  totalApplications: number
  shortlisted: number
  interviewsScheduled: number
  offersReleased: number
  joined: number
  pendingOffers: number
  conversionRate: number | null
  avgTimeToHireDays: number | null
  raw: Record<string, unknown>
}

export type PipelineStageCount = {
  status: string
  count: number
  label: string | null
}

export type RecruitmentPipeline = {
  stages: PipelineStageCount[]
  total: number
}

export type DashboardApplicationRow = {
  id: string
  candidateName: string | null
  jobTitle: string | null
  status: string | null
  appliedAt: string | null
}

export type DashboardInterviewRow = {
  id: string
  candidateName: string | null
  jobTitle: string | null
  round: string | null
  scheduledAt: string | null
}

export type DashboardActivityRow = {
  id: string
  text: string
  occurredAt: string | null
}

export type RecruitmentDashboardOverview = RecruitmentAnalyticsSummary