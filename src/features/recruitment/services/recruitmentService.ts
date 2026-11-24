/**
 * Recruitment data access layer.
 * Currently backed by local mock data only — no recruitment APIs exist yet.
 * Replace implementations with real HTTP calls when backend endpoints are available.
 */
import {
  candidates as seedCandidates,
  interviewFeedback as seedFeedback,
  interviews as seedInterviews,
  jobDescriptions as seedJds,
  jobPostings as seedJobs,
  offers as seedOffers,
  parsedResumeDemo,
  recruitmentActivities,
  stageHistory as seedHistory,
} from '../mocks/recruitmentMocks'
import type {
  Candidate,
  Interview,
  InterviewFeedback,
  JobDescription,
  JobPosting,
  Offer,
  ParsedResumeInfo,
  PipelineStage,
  StageHistoryItem,
} from '../types/recruitment'
import { canTransition } from '../utils/pipeline'

const DATA_SOURCE = 'mock' as const

export function getRecruitmentDataSource() {
  return DATA_SOURCE
}

export function listJobs(): JobPosting[] {
  return structuredClone(seedJobs)
}

export function listJobDescriptions(): JobDescription[] {
  return structuredClone(seedJds)
}

export function listCandidates(): Candidate[] {
  return structuredClone(seedCandidates)
}

export function listInterviews(): Interview[] {
  return structuredClone(seedInterviews)
}

export function listFeedback(): InterviewFeedback[] {
  return structuredClone(seedFeedback)
}

export function listOffers(): Offer[] {
  return structuredClone(seedOffers)
}

export function listActivities() {
  return structuredClone(recruitmentActivities)
}

export function listStageHistory(candidateId?: string): StageHistoryItem[] {
  const items = structuredClone(seedHistory)
  return candidateId
    ? items.filter((item) => item.candidateId === candidateId)
    : items
}

export function getParsedResume(candidateId: string): ParsedResumeInfo | null {
  return parsedResumeDemo[candidateId]
    ? structuredClone(parsedResumeDemo[candidateId])
    : null
}

export function transitionCandidateStage(
  list: Candidate[],
  candidateId: string,
  nextStage: PipelineStage,
): { ok: true; candidates: Candidate[] } | { ok: false; reason: string } {
  const current = list.find((c) => c.id === candidateId)
  if (!current) return { ok: false, reason: 'Candidate not found' }
  if (!canTransition(current.stage as never, nextStage as never)) {
    return {
      ok: false,
      reason: `Invalid transition from ${current.stage} to ${nextStage}`,
    }
  }
  return {
    ok: true,
    candidates: list.map((c) =>
      c.id === candidateId ? { ...c, stage: nextStage } : c,
    ),
  }
}
