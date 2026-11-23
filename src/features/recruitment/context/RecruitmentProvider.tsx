import { useCallback, useMemo, useState, type ReactNode } from 'react'

import {
  listCandidates,
  listInterviews,
  listJobs,
} from '../services/recruitmentService'
import type { Candidate, Interview, JobPosting } from '../types/recruitment'
import type { InterviewFormState } from '../utils/interviewForm'
import { RecruitmentContext } from './recruitmentContext'

type RecruitmentProviderProps = {
  children: ReactNode
}

export function RecruitmentProvider({ children }: RecruitmentProviderProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(() => listCandidates())
  const [jobs, setJobs] = useState<JobPosting[]>(() => listJobs())
  const [interviews, setInterviews] = useState<Interview[]>(() => listInterviews())

  const upsertInterview = useCallback(
    (editingId: string | null, form: InterviewFormState) => {
      if (!form.candidateId || !form.date) return
      const candidate = candidates.find((c) => c.id === form.candidateId)
      const job = jobs.find((j) => j.id === form.jobId)
      const payload = {
        candidateId: form.candidateId,
        candidateName: candidate?.fullName ?? 'Unknown',
        jobId: form.jobId,
        jobTitle: job?.title ?? candidate?.appliedJobTitle ?? 'Unknown',
        round: form.round.trim(),
        interviewType: form.interviewType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        interviewers: form.interviewers
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        meetingLink: form.meetingLink.trim(),
        location: form.location.trim(),
        notes: form.notes.trim(),
        status: form.status,
      }

      if (editingId) {
        setInterviews((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...payload } : item,
          ),
        )
      } else {
        setInterviews((prev) => [
          { ...payload, id: `INT-${300 + prev.length + 1}` },
          ...prev,
        ])
      }
    },
    [candidates, jobs],
  )

  const cancelInterview = useCallback((id: string) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Cancelled' as const } : item,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      candidates,
      jobs,
      interviews,
      setCandidates,
      setJobs,
      upsertInterview,
      cancelInterview,
    }),
    [candidates, jobs, interviews, upsertInterview, cancelInterview],
  )

  return (
    <RecruitmentContext.Provider value={value}>
      {children}
    </RecruitmentContext.Provider>
  )
}