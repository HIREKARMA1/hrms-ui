import { describe, expect, it, vi } from 'vitest'

import type { CandidatesPage } from '../api/candidatesApi.types'
import {
  buildApplicationCoverLetter,
  createSubmitGuard,
  findCandidateIdByEmail,
  isJobEligibleForInternalApply,
  resolveCandidateFromMe,
  resolveCandidateFromSearch,
  submitInternalApplication,
  validateApplyReference,
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

  it('resolves own candidate from /candidates/me without inventing ids', () => {
    expect(
      resolveCandidateFromMe({
        email: 'ada@hirekarma.in',
        candidate: PAGE.items[0],
      }),
    ).toEqual({ status: 'resolved', candidateId: 'cand-1' })
    expect(
      resolveCandidateFromMe({
        email: 'ada@hirekarma.in',
        candidate: undefined,
        is404: true,
      }).status,
    ).toBe('missing')
  })

  it('requires reference name and email when applying', () => {
    expect(
      validateApplyReference({ referenceName: '', referenceEmail: 'ref@hirekarma.in' }),
    ).toBeTruthy()
    expect(
      validateApplyReference({ referenceName: 'Asha', referenceEmail: 'bad' }),
    ).toBeTruthy()
    expect(
      validateApplyReference({
        referenceName: 'Asha Rao',
        referenceEmail: 'asha.rao@hirekarma.in',
      }),
    ).toBeNull()
  })

  it('embeds referral details in the cover letter payload', () => {
    expect(
      buildApplicationCoverLetter({
        referenceName: 'Asha Rao',
        referenceEmail: 'asha.rao@hirekarma.in',
        coverLetter: 'Interested in the role',
      }),
    ).toBe(
      'Referral reference: Asha Rao <asha.rao@hirekarma.in>\n\nInterested in the role',
    )
  })

  it('submits application with required job, candidate, and referral reference', async () => {
    const guard = createSubmitGuard()
    const send = vi.fn().mockReturnValue({
      unwrap: async () => ({
        id: 'app-1',
        jobPostingId: 'job-1',
        candidateId: 'cand-1',
        status: 'APPLIED',
        source: 'REFERRAL',
        coverLetter: 'Referral reference: Asha Rao <asha.rao@hirekarma.in>',
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
      referenceName: 'Asha Rao',
      referenceEmail: 'asha.rao@hirekarma.in',
      guard,
      send,
    })
    expect(outcome.status).toBe('success')
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'REFERRAL',
      coverLetter: 'Referral reference: Asha Rao <asha.rao@hirekarma.in>',
    })
  })
})
