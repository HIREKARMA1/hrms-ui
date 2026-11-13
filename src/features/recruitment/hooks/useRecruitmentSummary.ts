import { useMemo } from 'react'

import type { Candidate, Interview, JobPosting, Offer } from '../types/recruitment'

export function useRecruitmentSummary(input: {
  jobs: JobPosting[]
  candidates: Candidate[]
  interviews: Interview[]
  offers: Offer[]
}) {
  return useMemo(() => {
    const openJobs = input.jobs.filter((j) => j.status === 'Published').length
    const shortlisted = input.candidates.filter((c) =>
      [
        'Shortlisted',
        'Interview',
        'Selected',
        'Offer Released',
        'Joined',
      ].includes(c.stage),
    ).length
    const interviewsScheduled = input.interviews.filter(
      (i) => i.status === 'Scheduled',
    ).length
    const offersReleased = input.offers.filter((o) =>
      ['Released', 'Accepted', 'Rejected', 'Expired'].includes(o.status),
    ).length
    const joined = input.candidates.filter((c) => c.stage === 'Joined').length
    const pendingOffers = input.offers.filter((o) =>
      ['Draft', 'Pending Approval', 'Released'].includes(o.status),
    ).length

    return {
      openJobs,
      totalCandidates: input.candidates.length,
      applications: input.candidates.length,
      shortlisted,
      interviewsScheduled,
      offersReleased,
      joined,
      pendingOffers,
    }
  }, [input.jobs, input.candidates, input.interviews, input.offers])
}
