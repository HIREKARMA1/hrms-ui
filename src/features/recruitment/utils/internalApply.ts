/**
 * Internal job application helpers using production contracts only.
 * POST /recruitment/applications requires `jobPostingId` + `candidateId`.
 * AuthUser exposes `email` / optional `employeeId` but no candidate association —
 * resolve candidate by exact email match via GET /recruitment/candidates/search.
 */
import type { CandidatesPage } from '../api/candidatesApi.types'
import type {
  ApplicationSource,
  BackendApplication,
  CreateApplicationBody,
} from '../api/applicationsApi.types'
import { getApplicationErrorMessage } from '../api/applicationsApi'
import type { BackendJob } from '../api/jobsApi.types'
import { createSubmitGuard, type SubmitGuard } from '@/features/auth/utils/passwordReset'

export { createSubmitGuard }
export type { SubmitGuard }

export type ResolveCandidateOutcome =
  | { status: 'resolved'; candidateId: string }
  | { status: 'missing'; message: string }
  | { status: 'error'; message: string }

export type ApplyOutcome =
  | { status: 'busy' }
  | { status: 'blocked'; message: string }
  | { status: 'success'; application: BackendApplication }
  | { status: 'error'; message: string }

/** Jobs eligible for the internal board: published and active. */
export function isJobEligibleForInternalApply(job: Pick<BackendJob, 'status' | 'isActive'>): boolean {
  return job.status === 'PUBLISHED' && job.isActive
}

export function findCandidateIdByEmail(
  page: CandidatesPage | undefined,
  email: string,
): string | null {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !page?.items?.length) return null
  const match = page.items.find(
    (item) => item.email.trim().toLowerCase() === normalized && item.isActive,
  )
  return match?.id ?? null
}

export function resolveCandidateFromSearch(input: {
  email: string | null | undefined
  page: CandidatesPage | undefined
  searchError?: unknown
}): ResolveCandidateOutcome {
  const email = input.email?.trim()
  if (!email) {
    return {
      status: 'missing',
      message:
        'Your account has no email, so a candidate profile cannot be resolved for applications.',
    }
  }
  if (input.searchError) {
    return {
      status: 'error',
      message: getApplicationErrorMessage(
        input.searchError,
        'Could not look up a candidate profile for your account. The API requires candidateId to apply and does not expose an employee-to-candidate link.',
      ),
    }
  }
  const candidateId = findCandidateIdByEmail(input.page, email)
  if (!candidateId) {
    return {
      status: 'missing',
      message:
        'No active candidate profile matches your account email. Ask HR to create a recruitment candidate record for you before applying. Do not invent a candidateId.',
    }
  }
  return { status: 'resolved', candidateId }
}

export async function submitInternalApplication(input: {
  jobPostingId: string
  candidateId: string
  coverLetter?: string
  source?: ApplicationSource
  guard: SubmitGuard
  send: (body: CreateApplicationBody) => { unwrap: () => Promise<BackendApplication> }
}): Promise<ApplyOutcome> {
  if (!input.jobPostingId.trim() || !input.candidateId.trim()) {
    return {
      status: 'blocked',
      message: 'jobPostingId and candidateId are required by POST /recruitment/applications.',
    }
  }
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const body: CreateApplicationBody = {
      jobPostingId: input.jobPostingId.trim(),
      candidateId: input.candidateId.trim(),
      source: input.source ?? 'OTHER',
    }
    const cover = input.coverLetter?.trim()
    if (cover) body.coverLetter = cover
    const application = await input.send(body).unwrap()
    return { status: 'success', application }
  } catch (error) {
    return {
      status: 'error',
      message: getApplicationErrorMessage(
        error,
        'Could not submit your application. If you already applied, the API blocks duplicate active applications for the same job and candidate.',
      ),
    }
  } finally {
    input.guard.leave()
  }
}
