import type { EmploymentType, InterviewType } from '../types/recruitment'

export type SuggestedRound = {
  label: string
  interviewType: InterviewType
}

const DEFAULT_ROUNDS: SuggestedRound[] = [
  { label: 'Screening', interviewType: 'HR' },
  { label: 'Technical', interviewType: 'Technical' },
  { label: 'Managerial', interviewType: 'Managerial' },
  { label: 'Final', interviewType: 'Final' },
]

const INTERN_ROUNDS: SuggestedRound[] = [
  { label: 'Screening', interviewType: 'HR' },
  { label: 'Technical', interviewType: 'Technical' },
  { label: 'HR', interviewType: 'HR' },
]

export function getSuggestedRounds(
  employmentType: EmploymentType,
): SuggestedRound[] {
  if (employmentType === 'Internship') return INTERN_ROUNDS
  if (employmentType === 'Contract') {
    return DEFAULT_ROUNDS.filter((r) => r.interviewType !== 'Managerial')
  }
  return DEFAULT_ROUNDS
}