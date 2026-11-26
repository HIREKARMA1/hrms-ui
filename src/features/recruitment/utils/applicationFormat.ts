import type { ApplicationStatus } from '../api/applicationsApi.types'
import type { CandidateSource } from '../api/candidatesApi.types'
import type { OfferStatus } from '../api/offersApi.types'

export function formatApplicationStatus(status: ApplicationStatus | string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => (part === 'offer' ? 'Offer' : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ')
}

export function formatCandidateSource(source: CandidateSource): string {
  const map: Record<CandidateSource, string> = {
    CAREER_PAGE: 'Career page',
    REFERRAL: 'Referral',
    LINKEDIN: 'LinkedIn',
    JOB_PORTAL: 'Job portal',
    AGENCY: 'Agency',
    WALK_IN: 'Walk-in',
    OTHER: 'Other',
  }
  return map[source] ?? source
}

export function formatOfferStatus(status: OfferStatus): string {
  const map: Record<OfferStatus, string> = {
    RELEASED: 'Released',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  }
  return map[status] ?? status
}

export function formatExperienceYears(years: number | null): string {
  if (years === null || years === undefined) return '—'
  if (years < 1) return '< 1 yr'
  return years === 1 ? '1 yr' : `${years} yrs`
}