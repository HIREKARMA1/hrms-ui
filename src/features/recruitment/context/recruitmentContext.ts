import { createContext, type Dispatch, type SetStateAction } from 'react'

import type { Candidate, Interview, JobPosting } from '../types/recruitment'
import type { InterviewFormState } from '../utils/interviewForm'

export type RecruitmentContextValue = {
  candidates: Candidate[]
  jobs: JobPosting[]
  interviews: Interview[]
  setCandidates: Dispatch<SetStateAction<Candidate[]>>
  setJobs: Dispatch<SetStateAction<JobPosting[]>>
  upsertInterview: (editingId: string | null, form: InterviewFormState) => void
  cancelInterview: (id: string) => void
}

export const RecruitmentContext = createContext<RecruitmentContextValue | null>(
  null,
)