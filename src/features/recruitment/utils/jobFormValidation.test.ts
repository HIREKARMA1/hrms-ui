import { describe, expect, it } from 'vitest'

import {
  buildCreateJobBody,
  buildUpdateJobBody,
  validateCreateJobForm,
} from './jobFormValidation'

const valid = {
  title: 'Backend Engineer',
  departmentId: '',
  employmentType: 'FULL_TIME' as const,
  location: 'Bengaluru',
  workMode: 'REMOTE' as const,
  openings: '1',
  minExperienceYears: '',
  maxExperienceYears: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'INR',
  description: 'Build APIs',
  requirements: '',
  skillsText: '',
  applicationDeadline: '',
  status: 'DRAFT' as const,
}

describe('jobFormValidation', () => {
  it('does not require reference fields on HR job create', () => {
    expect(validateCreateJobForm(valid)).toEqual({})
  })

  it('requires core job fields only', () => {
    expect(validateCreateJobForm({ ...valid, title: '' }).title).toBeTruthy()
    expect(validateCreateJobForm({ ...valid, location: '' }).location).toBeTruthy()
  })

  it('does not serialize reference fields onto the create payload', () => {
    const body = buildCreateJobBody(valid)
    expect(body).not.toHaveProperty('referenceName')
    expect(body).not.toHaveProperty('referenceEmail')
    expect(body).toMatchObject({
      title: 'Backend Engineer',
      location: 'Bengaluru',
      employmentType: 'FULL_TIME',
    })
  })

  it('builds an update patch without reference fields', () => {
    const { body, errors } = buildUpdateJobBody(
      { ...valid, title: 'Senior Backend Engineer' },
      {
        title: valid.title,
        departmentId: null,
        employmentType: 'FULL_TIME',
        location: valid.location,
        workMode: 'REMOTE',
        openings: 1,
        minExperienceYears: null,
        maxExperienceYears: null,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'INR',
        requirements: null,
        skills: [],
        applicationDeadline: null,
        status: 'DRAFT',
      },
    )
    expect(errors).toEqual({})
    expect(body).toEqual({ title: 'Senior Backend Engineer' })
  })
})
