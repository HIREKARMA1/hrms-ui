/**
 * Internal job application helpers using production contracts only.
 * POST /recruitment/applications requires `jobPostingId` + `candidateId`.
 * Resolve the signed-in user's candidate via GET /recruitment/candidates/me
 * (jobs:read). Legacy search-by-email helpers remain for tests/compatibility.
 */
import type { BackendCandidate, CandidatesPage } from '../api/candidatesApi.types'
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

const MISSING_CANDIDATE_MESSAGE =
  'No active candidate profile matches your account email. Ask HR to create a recruitment candidate record for you before applying. Do not invent a candidateId.'

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

/** Prefer GET /recruitment/candidates/me for Manager/Employee panels. */
export function resolveCandidateFromMe(input: {
  email: string | null | undefined
  candidate: BackendCandidate | undefined
  fetchError?: unknown
  is404?: boolean
}): ResolveCandidateOutcome {
  const email = input.email?.trim()
  if (!email) {
    return {
      status: 'missing',
      message:
        'Your account has no email, so a candidate profile cannot be resolved for applications.',
    }
  }
  if (input.is404) {
    return { status: 'missing', message: MISSING_CANDIDATE_MESSAGE }
  }
  if (input.fetchError) {
    return {
      status: 'error',
      message: getApplicationErrorMessage(
        input.fetchError,
        'Could not look up a candidate profile for your account.',
      ),
    }
  }
  if (input.candidate?.id && input.candidate.isActive) {
    return { status: 'resolved', candidateId: input.candidate.id }
  }
  return { status: 'missing', message: MISSING_CANDIDATE_MESSAGE }
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
      message: MISSING_CANDIDATE_MESSAGE,
    }
  }
  return { status: 'resolved', candidateId }
}

const REFERENCE_NAME_MAX = 200
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ApplyReferenceInput = {
  referenceName: string
  referenceEmail: string
}

export function validateApplyReference(input: ApplyReferenceInput): string | null {
  const name = input.referenceName.trim()
  const email = input.referenceEmail.trim()
  if (!name) return 'Reference Name is required when applying.'
  if (name.length > REFERENCE_NAME_MAX) {
    return `Reference Name must be at most ${REFERENCE_NAME_MAX} characters.`
  }
  if (!email) return 'Reference Email ID is required when applying.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid reference email address.'
  if (email.length > 254) return 'Reference Email ID is too long.'
  return null
}

/** Embed referral details in coverLetter until the applications API has dedicated fields. */
export function buildApplicationCoverLetter(input: {
  referenceName: string
  referenceEmail: string
  coverLetter?: string
}): string {
  const header = `Referral reference: ${input.referenceName.trim()} <${input.referenceEmail.trim().toLowerCase()}>`
  const note = input.coverLetter?.trim()
  return note ? `${header}\n\n${note}` : header
}

export async function submitInternalApplication(input: {
  jobPostingId: string
  candidateId: string
  referenceName: string
  referenceEmail: string
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
  const referenceError = validateApplyReference({
    referenceName: input.referenceName,
    referenceEmail: input.referenceEmail,
  })
  if (referenceError) {
    return { status: 'blocked', message: referenceError }
  }
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const body: CreateApplicationBody = {
      jobPostingId: input.jobPostingId.trim(),
      candidateId: input.candidateId.trim(),
      source: input.source ?? 'REFERRAL',
      coverLetter: buildApplicationCoverLetter({
        referenceName: input.referenceName,
        referenceEmail: input.referenceEmail,
        coverLetter: input.coverLetter,
      }),
    }
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
