import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '../api/applicationsApi.types'

/** Kanban columns mirror production application statuses (OpenAPI). */
export const PIPELINE_STAGES: ApplicationStatus[] = [...APPLICATION_STATUSES]

const FORWARD: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED', 'WITHDRAWN'],
  SELECTED: ['OFFER_RELEASED', 'REJECTED', 'WITHDRAWN'],
  OFFER_RELEASED: ['JOINED', 'REJECTED', 'WITHDRAWN'],
  JOINED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

export function getAllowedNextStatuses(current: ApplicationStatus): ApplicationStatus[] {
  return FORWARD[current] ?? []
}

export function getAllowedNextStages(current: ApplicationStatus): ApplicationStatus[] {
  return getAllowedNextStatuses(current)
}

export function canTransitionStatus(from: ApplicationStatus, to: ApplicationStatus): boolean {
  if (from === to) return true
  return getAllowedNextStatuses(from).includes(to)
}

/** @deprecated Prefer `canTransitionStatus` — mock hiring desk only. */
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return canTransitionStatus(from, to)
}