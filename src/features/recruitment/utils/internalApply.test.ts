import { describe, expect, it, vi } from 'vitest'

import type { CandidatesPage } from '../api/candidatesApi.types'
import {
  createSubmitGuard,
  findCandidateIdByEmail,
  isJobEligibleForInternalApply,
  resolveCandidateFromSearch,
  submitInternalApplication,
} from './internalApply'

const PAGE: CandidatesPage = {
  items: [
    {
      id: 'cand-1',
      fullName: 'Ada',
      email: 'ada@hirekarma.in',
      phone: '1',
      location: null,
      experienceYears: null,
      currentCompany: null,
      currentDesignation: null,
      skills: [],
      source: 'OTHER',
      isActive: true,
      resumes: [],
      createdAt: null,
      updatedAt: null,
    },
    {
      id: 'cand-inactive',
      fullName: 'Inactive',
      email: 'inactive@hirekarma.in',
      phone: '1',
      location: null,
      experienceYears: null,
      currentCompany: null,
      currentDesignation: null,
      skills: [],
      source: 'OTHER',
      isActive: false,
      resumes: [],
      createdAt: null,
      updatedAt: null,
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
}

describe('internalApply', () => {
  it('treats only PUBLISHED + active jobs as eligible', () => {
    expect(isJobEligibleForInternalApply({ status: 'PUBLISHED', isActive: true })).toBe(true)
    expect(isJobEligibleForInternalApply({ status: 'DRAFT', isActive: true })).toBe(false)
    expect(isJobEligibleForInternalApply({ status: 'PUBLISHED', isActive: false })).toBe(false)
  })

  it('matches candidate by exact email and active flag', () => {
    expect(findCandidateIdByEmail(PAGE, 'ADA@hirekarma.in')).toBe('cand-1')
    expect(findCandidateIdByEmail(PAGE, 'inactive@hirekarma.in')).toBeNull()
    expect(findCandidateIdByEmail(PAGE, 'missing@hirekarma.in')).toBeNull()
  })

  it('reports missing candidate association without inventing ids', () => {
    expect(resolveCandidateFromSearch({ email: 'ada@hirekarma.in', page: PAGE })).toEqual({
      status: 'resolved',
      candidateId: 'cand-1',
    })
    const missing = resolveCandidateFromSearch({
      email: 'nobody@hirekarma.in',
      page: PAGE,
    })
    expect(missing.status).toBe('missing')
  })

  it('submits application with required jobPostingId + candidateId', async () => {
    const guard = createSubmitGuard()
    const send = vi.fn().mockReturnValue({
      unwrap: async () => ({
        id: 'app-1',
        jobPostingId: 'job-1',
        candidateId: 'cand-1',
        status: 'APPLIED',
        source: 'OTHER',
        coverLetter: null,
        appliedAt: null,
        createdAt: null,
        updatedAt: null,
        candidate: null,
        jobPosting: null,
      }),
    })
    const outcome = await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      guard,
      send,
    })
    expect(outcome.status).toBe('success')
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'OTHER',
    })
  })
})
