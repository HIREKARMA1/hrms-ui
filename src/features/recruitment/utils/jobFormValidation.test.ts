import { describe, expect, it } from 'vitest'

import {
  JOB_REFERENCE_FIELDS_IN_OPENAPI,
  buildCreateJobBody,
  buildUpdateJobBody,
  validateCreateJobForm,
} from './jobFormValidation'

const valid = {
  title: 'Backend Engineer',
  referenceName: 'Asha Rao',
  referenceEmail: 'asha.rao@hirekarma.in',
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

describe('jobFormValidation reference fields', () => {
  it('documents that OpenAPI does not yet include reference fields', () => {
    expect(JOB_REFERENCE_FIELDS_IN_OPENAPI).toBe(false)
  })

  it('requires reference name and a valid reference email', () => {
    expect(validateCreateJobForm({ ...valid, referenceName: '' }).referenceName).toBeTruthy()
    expect(
      validateCreateJobForm({ ...valid, referenceEmail: 'bad' }).referenceEmail,
    ).toBeTruthy()
    expect(validateCreateJobForm(valid)).toEqual({})
  })

  it('serializes reference fields onto the create payload', () => {
    expect(buildCreateJobBody(valid)).toMatchObject({
      referenceName: 'Asha Rao',
      referenceEmail: 'asha.rao@hirekarma.in',
    })
  })

  it('includes reference fields in the update patch when changed', () => {
    const { body, errors } = buildUpdateJobBody(
      { ...valid, referenceName: 'New Ref', referenceEmail: 'new.ref@hirekarma.in' },
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
        referenceName: 'Asha Rao',
        referenceEmail: 'asha.rao@hirekarma.in',
        status: 'DRAFT',
      },
    )
    expect(errors).toEqual({})
    expect(body).toEqual({
      referenceName: 'New Ref',
      referenceEmail: 'new.ref@hirekarma.in',
    })
  })
})
