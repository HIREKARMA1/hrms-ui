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

function mockSend(overrides: Record<string, unknown> = {}) {
  return vi.fn().mockReturnValue({
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
      ...overrides,
    }),
  })
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

  it('keeps Apply gated while /candidates/me is loading', () => {
    expect(
      resolveCandidateFromMe({
        email: 'ada@hirekarma.in',
        candidate: undefined,
        isLoading: true,
      }),
    ).toEqual({ status: 'pending' })
  })

  it('treats inactive linked profiles as blocked, not inventable', () => {
    const inactive = resolveCandidateFromMe({
      email: 'inactive@hirekarma.in',
      candidate: PAGE.items[1],
    })
    expect(inactive.status).toBe('inactive')
  })

  it('rejects /candidates/me payloads whose email does not match the account', () => {
    const mismatch = resolveCandidateFromMe({
      email: 'other@hirekarma.in',
      candidate: PAGE.items[0],
    })
    expect(mismatch.status).toBe('error')
  })

  it('surfaces resolution failures without fabricating a candidateId', () => {
    const failed = resolveCandidateFromMe({
      email: 'ada@hirekarma.in',
      candidate: undefined,
      fetchError: { status: 500, data: { message: 'lookup failed' } },
    })
    expect(failed.status).toBe('error')
    expect(
      resolveCandidateFromMe({
        email: 'ada@hirekarma.in',
        candidate: null,
      }).status,
    ).toBe('missing')
  })

  it('reports 403 on /candidates/me as a permission error, not a missing profile', () => {
    const forbidden = resolveCandidateFromMe({
      email: 'ada@hirekarma.in',
      candidate: undefined,
      is403: true,
      fetchError: { status: 403, data: { message: 'Forbidden' } },
    })
    expect(forbidden.status).toBe('error')
    expect(forbidden.message).toMatch(/permission/i)
  })

  it('allows empty optional reference and cover letter fields', () => {
    expect(
      validateApplyReference({ referenceName: '', referenceEmail: '', coverLetter: '' }),
    ).toBeNull()
    expect(
      validateApplyReference({
        referenceName: 'Asha',
        referenceEmail: '',
        coverLetter: '',
      }),
    ).toBeNull()
    expect(
      validateApplyReference({
        referenceName: '',
        referenceEmail: 'asha.rao@hirekarma.in',
      }),
    ).toBeNull()
  })

  it('rejects invalid reference email only when entered', () => {
    expect(
      validateApplyReference({ referenceName: '', referenceEmail: 'bad' }),
    ).toBeTruthy()
    expect(
      validateApplyReference({
        referenceName: 'Asha Rao',
        referenceEmail: 'asha.rao@hirekarma.in',
      }),
    ).toBeNull()
  })

  it('builds cover letter only from provided optional values', () => {
    expect(
      buildApplicationCoverLetter({
        referenceName: '',
        referenceEmail: '',
        coverLetter: '',
      }),
    ).toBeNull()
    expect(
      buildApplicationCoverLetter({
        referenceName: 'Asha Rao',
        referenceEmail: '',
        coverLetter: '',
      }),
    ).toBe('Referral reference: Asha Rao')
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

  it('submits with only jobPostingId + candidateId when optional fields are empty', async () => {
    const send = mockSend()
    const outcome = await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: '',
      referenceEmail: '',
      coverLetter: '   ',
      guard: createSubmitGuard(),
      send,
    })
    expect(outcome.status).toBe('success')
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'OTHER',
    })
  })

  it('submits with only Reference Name', async () => {
    const send = mockSend()
    await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: 'Asha Rao',
      referenceEmail: '',
      guard: createSubmitGuard(),
      send,
    })
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'REFERRAL',
      coverLetter: 'Referral reference: Asha Rao',
    })
  })

  it('submits with only Reference Email ID', async () => {
    const send = mockSend()
    await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: '',
      referenceEmail: 'asha.rao@hirekarma.in',
      guard: createSubmitGuard(),
      send,
    })
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'REFERRAL',
      coverLetter: 'Referral reference: <asha.rao@hirekarma.in>',
    })
  })

  it('blocks invalid Reference Email ID without calling the API', async () => {
    const send = mockSend()
    const outcome = await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: '',
      referenceEmail: 'not-an-email',
      guard: createSubmitGuard(),
      send,
    })
    expect(outcome.status).toBe('blocked')
    expect(send).not.toHaveBeenCalled()
  })

  it('submits with only Cover Letter', async () => {
    const send = mockSend()
    await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: '',
      referenceEmail: '',
      coverLetter: 'Please consider my application.',
      guard: createSubmitGuard(),
      send,
    })
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'OTHER',
      coverLetter: 'Please consider my application.',
    })
  })

  it('submits with all three optional fields populated', async () => {
    const send = mockSend()
    await submitInternalApplication({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      referenceName: 'Asha Rao',
      referenceEmail: 'asha.rao@hirekarma.in',
      coverLetter: 'Interested in the role',
      guard: createSubmitGuard(),
      send,
    })
    expect(send).toHaveBeenCalledWith({
      jobPostingId: 'job-1',
      candidateId: 'cand-1',
      source: 'REFERRAL',
      coverLetter:
        'Referral reference: Asha Rao <asha.rao@hirekarma.in>\n\nInterested in the role',
    })
  })
})
