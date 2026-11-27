/**
 * Internal job application helpers using production contracts only.
 * POST /recruitment/applications requires `jobPostingId` + `candidateId`.
 * Resolve the signed-in user's candidate via GET /recruitment/candidates/me
 * (OpenAPI: active candidate whose email matches the authenticated user).
 * There is no ensure/create-self endpoint — never invent a candidateId.
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
  | { status: 'pending' }
  | { status: 'resolved'; candidateId: string }
  | { status: 'missing'; message: string }
  | { status: 'inactive'; message: string }
  | { status: 'error'; message: string }

export type ApplyOutcome =
  | { status: 'busy' }
  | { status: 'blocked'; message: string }
  | { status: 'success'; application: BackendApplication }
  | { status: 'error'; message: string }

/** User-facing copy when GET /recruitment/candidates/me finds no active profile. */
export function missingCandidateMessage(accountEmail?: string | null): string {
  const email = accountEmail?.trim()
  const emailClause = email
    ? ` matching your account email (${email})`
    : ' matching your account email'
  return `No active recruitment candidate profile${emailClause} was found. Ask HR to create a candidate record with this exact email so you can apply for internal jobs.`
}

const INACTIVE_CANDIDATE_MESSAGE =
  'Your linked recruitment candidate profile is inactive. Ask HR to reactivate it before applying for internal jobs.'

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

/**
 * Prefer GET /recruitment/candidates/me for Manager/Employee panels.
 * Association is server-side email match on the authenticated account — not a
 * client-side unverified search, and not a fabricated id.
 */
export function resolveCandidateFromMe(input: {
  email: string | null | undefined
  candidate: BackendCandidate | null | undefined
  fetchError?: unknown
  is404?: boolean
  is403?: boolean
  isLoading?: boolean
}): ResolveCandidateOutcome {
  const email = input.email?.trim()
  if (!email) {
    return {
      status: 'missing',
      message:
        'Your account has no email, so a candidate profile cannot be resolved for applications.',
    }
  }
  if (input.isLoading) return { status: 'pending' }
  if (input.is404) {
    return { status: 'missing', message: missingCandidateMessage(email) }
  }
  if (input.is403) {
    return {
      status: 'error',
      message:
        'You do not have permission to look up your recruitment candidate profile (GET /recruitment/candidates/me). Ask an administrator to grant the internal job-board candidate permission — do not invent a candidateId.',
    }
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
  if (input.candidate?.id) {
    const candidateEmail = input.candidate.email.trim().toLowerCase()
    if (candidateEmail && candidateEmail !== email.toLowerCase()) {
      return {
        status: 'error',
        message:
          'The candidate profile returned by the server does not match your account email. Applying was blocked to avoid using the wrong candidate record.',
      }
    }
    if (!input.candidate.isActive) {
      return { status: 'inactive', message: INACTIVE_CANDIDATE_MESSAGE }
    }
    return { status: 'resolved', candidateId: input.candidate.id }
  }
  return { status: 'missing', message: missingCandidateMessage(email) }
}

/** Legacy ATS search-by-email helper (HR tools / tests). Prefer /candidates/me for apply. */
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
      message: missingCandidateMessage(email),
    }
  }
  return { status: 'resolved', candidateId }
}

const REFERENCE_NAME_MAX = 200
/** Align with common OpenAPI string caps used elsewhere in recruitment forms. */
const COVER_LETTER_MAX = 20000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ApplyReferenceInput = {
  referenceName: string
  referenceEmail: string
  coverLetter?: string
}

/**
 * Optional apply fields: empty values are allowed.
 * Validate format/length only when the user entered a value.
 */
export function validateApplyReference(input: ApplyReferenceInput): string | null {
  const name = input.referenceName.trim()
  const email = input.referenceEmail.trim()
  const note = input.coverLetter?.trim() ?? ''

  if (name && name.length > REFERENCE_NAME_MAX) {
    return `Reference Name must be at most ${REFERENCE_NAME_MAX} characters.`
  }
  if (email) {
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid reference email address.'
    if (email.length > 254) return 'Reference Email ID is too long.'
  }
  if (note.length > COVER_LETTER_MAX) {
    return `Cover letter must be at most ${COVER_LETTER_MAX} characters.`
  }
  return null
}

/**
 * Build optional coverLetter text. Applications API has no referenceName/referenceEmail
 * properties — when provided, embed referral details in coverLetter.
 * Returns null when there is nothing to send (omit from POST body).
 */
export function buildApplicationCoverLetter(input: {
  referenceName: string
  referenceEmail: string
  coverLetter?: string
}): string | null {
  const name = input.referenceName.trim()
  const email = input.referenceEmail.trim().toLowerCase()
  const note = input.coverLetter?.trim() ?? ''

  const parts: string[] = []
  if (name && email) {
    parts.push(`Referral reference: ${name} <${email}>`)
  } else if (name) {
    parts.push(`Referral reference: ${name}`)
  } else if (email) {
    parts.push(`Referral reference: <${email}>`)
  }
  if (note) parts.push(note)

  if (parts.length === 0) return null
  return parts.join('\n\n')
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
    coverLetter: input.coverLetter,
  })
  if (referenceError) {
    return { status: 'blocked', message: referenceError }
  }
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const hasReferral =
      Boolean(input.referenceName.trim()) || Boolean(input.referenceEmail.trim())
    const coverLetter = buildApplicationCoverLetter({
      referenceName: input.referenceName,
      referenceEmail: input.referenceEmail,
      coverLetter: input.coverLetter,
    })
    const body: CreateApplicationBody = {
      jobPostingId: input.jobPostingId.trim(),
      candidateId: input.candidateId.trim(),
      source: input.source ?? (hasReferral ? 'REFERRAL' : 'OTHER'),
    }
    // Omit empty coverLetter — CreateApplicationBody.coverLetter is optional.
    if (coverLetter) body.coverLetter = coverLetter
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
