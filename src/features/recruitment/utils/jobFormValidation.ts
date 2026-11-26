/**
 * Client-side checks aligned with production OpenAPI for `/recruitment/jobs`,
 * plus required Reference Name / Reference Email for the internal job workflow.
 *
 * Production CreateJobDto / UpdateJobDto do not list `referenceName` or
 * `referenceEmail`. The UI still validates and serializes them on the request
 * body so values are not silently dropped; persistence requires a backend update.
 */
import type {
  CreateJobBody,
  JobEmploymentType,
  JobPostingStatus,
  JobWorkMode,
  UpdateJobBody,
} from '../api/jobsApi.types'

export const JOB_TITLE_MAX = 200
export const JOB_LOCATION_MAX = 200
export const JOB_TEXT_MAX = 20000
export const JOB_SKILL_MAX = 100
export const JOB_SKILLS_MAX = 50
export const JOB_OPENINGS_MAX = 9999
export const JOB_REFERENCE_NAME_MAX = 200
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
/** Practical email shape check (format only; not DNS). */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Production OpenAPI (`/api/v1/recruitment/jobs` POST/PATCH) does not document
 * referenceName or referenceEmail anywhere in the swagger document.
 */
export const JOB_REFERENCE_FIELDS_IN_OPENAPI = false

export type JobFormErrors = {
  title?: string
  referenceName?: string
  referenceEmail?: string
  employmentType?: string
  location?: string
  workMode?: string
  description?: string
  openings?: string
  experience?: string
  salary?: string
  salaryCurrency?: string
  applicationDeadline?: string
  skills?: string
  form?: string
}

export type JobFormValues = {
  title: string
  referenceName: string
  referenceEmail: string
  departmentId: string
  employmentType: JobEmploymentType | ''
  location: string
  workMode: JobWorkMode | ''
  openings: string
  minExperienceYears: string
  maxExperienceYears: string
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  description: string
  requirements: string
  skillsText: string
  applicationDeadline: string
  status: JobPostingStatus
}

export function parseSkills(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, JOB_SKILLS_MAX)
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : Number.NaN
}

export function validateCreateJobForm(values: JobFormValues): JobFormErrors {
  const errors: JobFormErrors = {}
  const title = values.title.trim()
  const location = values.location.trim()
  const description = values.description.trim()
  const referenceName = values.referenceName.trim()
  const referenceEmail = values.referenceEmail.trim()

  if (!title) errors.title = 'Title is required.'
  else if (title.length > JOB_TITLE_MAX) errors.title = `Title must be at most ${JOB_TITLE_MAX} characters.`

  if (!referenceName) errors.referenceName = 'Reference Name is required.'
  else if (referenceName.length > JOB_REFERENCE_NAME_MAX) {
    errors.referenceName = `Reference Name must be at most ${JOB_REFERENCE_NAME_MAX} characters.`
  }

  if (!referenceEmail) errors.referenceEmail = 'Reference Email ID is required.'
  else if (!EMAIL_PATTERN.test(referenceEmail)) {
    errors.referenceEmail = 'Enter a valid email address.'
  } else if (referenceEmail.length > 254) {
    errors.referenceEmail = 'Reference Email ID is too long.'
  }

  if (!values.employmentType) errors.employmentType = 'Employment type is required.'
  if (!location) errors.location = 'Location is required.'
  else if (location.length > JOB_LOCATION_MAX) {
    errors.location = `Location must be at most ${JOB_LOCATION_MAX} characters.`
  }
  if (!values.workMode) errors.workMode = 'Work mode is required.'

  if (!description) errors.description = 'Description is required.'
  else if (description.length > JOB_TEXT_MAX) {
    errors.description = `Description must be at most ${JOB_TEXT_MAX} characters.`
  }

  if (values.requirements.trim().length > JOB_TEXT_MAX) {
    errors.form = `Requirements must be at most ${JOB_TEXT_MAX} characters.`
  }

  const openings = parseOptionalNumber(values.openings)
  if (values.openings.trim() && (openings === undefined || Number.isNaN(openings) || openings < 1 || openings > JOB_OPENINGS_MAX)) {
    errors.openings = `Openings must be between 1 and ${JOB_OPENINGS_MAX}.`
  }

  const minExp = parseOptionalNumber(values.minExperienceYears)
  const maxExp = parseOptionalNumber(values.maxExperienceYears)
  if (values.minExperienceYears.trim() && (minExp === undefined || Number.isNaN(minExp) || minExp < 0 || minExp > 50)) {
    errors.experience = 'Experience years must be between 0 and 50.'
  }
  if (values.maxExperienceYears.trim() && (maxExp === undefined || Number.isNaN(maxExp) || maxExp < 0 || maxExp > 50)) {
    errors.experience = 'Experience years must be between 0 and 50.'
  }
  if (
    minExp !== undefined &&
    maxExp !== undefined &&
    !Number.isNaN(minExp) &&
    !Number.isNaN(maxExp) &&
    maxExp < minExp
  ) {
    errors.experience = 'Max experience must be greater than or equal to min experience.'
  }

  const salaryMin = parseOptionalNumber(values.salaryMin)
  const salaryMax = parseOptionalNumber(values.salaryMax)
  if (values.salaryMin.trim() && (salaryMin === undefined || Number.isNaN(salaryMin) || salaryMin < 0)) {
    errors.salary = 'Salary values must be zero or greater.'
  }
  if (values.salaryMax.trim() && (salaryMax === undefined || Number.isNaN(salaryMax) || salaryMax < 0)) {
    errors.salary = 'Salary values must be zero or greater.'
  }
  if (
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    !Number.isNaN(salaryMin) &&
    !Number.isNaN(salaryMax) &&
    salaryMax < salaryMin
  ) {
    errors.salary = 'Max salary must be greater than or equal to min salary.'
  }

  const currency = values.salaryCurrency.trim().toUpperCase()
  if (currency && currency.length !== 3) {
    errors.salaryCurrency = 'Currency must be a 3-letter code (e.g. INR).'
  }

  const deadline = values.applicationDeadline.trim()
  if (deadline && !DATE_PATTERN.test(deadline)) {
    errors.applicationDeadline = 'Deadline must use YYYY-MM-DD.'
  }

  const skills = parseSkills(values.skillsText)
  if (skills.some((skill) => skill.length > JOB_SKILL_MAX)) {
    errors.skills = `Each skill must be at most ${JOB_SKILL_MAX} characters.`
  }

  return errors
}

export function buildCreateJobBody(values: JobFormValues): CreateJobBody {
  const body: CreateJobBody = {
    title: values.title.trim(),
    employmentType: values.employmentType as JobEmploymentType,
    location: values.location.trim(),
    workMode: values.workMode as JobWorkMode,
    description: values.description.trim(),
    status: values.status,
    referenceName: values.referenceName.trim(),
    referenceEmail: values.referenceEmail.trim().toLowerCase(),
  }

  if (values.departmentId.trim()) body.departmentId = values.departmentId.trim()

  const openings = parseOptionalNumber(values.openings)
  if (openings !== undefined && !Number.isNaN(openings)) body.openings = Math.trunc(openings)

  const minExp = parseOptionalNumber(values.minExperienceYears)
  if (minExp !== undefined && !Number.isNaN(minExp)) body.minExperienceYears = minExp
  const maxExp = parseOptionalNumber(values.maxExperienceYears)
  if (maxExp !== undefined && !Number.isNaN(maxExp)) body.maxExperienceYears = maxExp

  const salaryMin = parseOptionalNumber(values.salaryMin)
  if (salaryMin !== undefined && !Number.isNaN(salaryMin)) body.salaryMin = salaryMin
  const salaryMax = parseOptionalNumber(values.salaryMax)
  if (salaryMax !== undefined && !Number.isNaN(salaryMax)) body.salaryMax = salaryMax

  const currency = values.salaryCurrency.trim().toUpperCase()
  if (currency) body.salaryCurrency = currency

  if (values.requirements.trim()) body.requirements = values.requirements.trim()

  const skills = parseSkills(values.skillsText)
  if (skills.length) body.skills = skills

  if (values.applicationDeadline.trim()) {
    body.applicationDeadline = values.applicationDeadline.trim()
  }

  return body
}

export function buildUpdateJobBody(
  values: JobFormValues,
  original: {
    title: string
    departmentId: string | null
    employmentType: JobEmploymentType
    location: string
    workMode: JobWorkMode
    openings: number
    minExperienceYears: number | null
    maxExperienceYears: number | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string | null
    requirements: string | null
    skills: string[]
    applicationDeadline: string | null
    referenceName: string | null
    referenceEmail: string | null
    status: JobPostingStatus
  },
): { body: UpdateJobBody; errors: JobFormErrors } {
  const errors = validateCreateJobForm({ ...values, description: 'placeholder' })
  delete errors.description
  if (Object.keys(errors).length) return { body: {}, errors }

  const next = buildCreateJobBody({ ...values, description: 'placeholder' })
  const body: UpdateJobBody = {}

  if (next.title !== original.title) body.title = next.title
  const nextDept = next.departmentId ?? null
  if (nextDept !== original.departmentId) body.departmentId = nextDept
  if (next.employmentType !== original.employmentType) body.employmentType = next.employmentType
  if (next.location !== original.location) body.location = next.location
  if (next.workMode !== original.workMode) body.workMode = next.workMode
  if ((next.openings ?? 1) !== original.openings) body.openings = next.openings ?? 1

  const nextMin = next.minExperienceYears ?? null
  if (nextMin !== original.minExperienceYears) body.minExperienceYears = nextMin
  const nextMax = next.maxExperienceYears ?? null
  if (nextMax !== original.maxExperienceYears) body.maxExperienceYears = nextMax

  const nextSalMin = next.salaryMin ?? null
  if (nextSalMin !== original.salaryMin) body.salaryMin = nextSalMin
  const nextSalMax = next.salaryMax ?? null
  if (nextSalMax !== original.salaryMax) body.salaryMax = nextSalMax
  const nextCurrency = next.salaryCurrency ?? original.salaryCurrency
  if ((next.salaryCurrency ?? null) !== original.salaryCurrency) {
    body.salaryCurrency = nextCurrency ?? undefined
  }

  const nextReq = next.requirements ?? null
  if (nextReq !== original.requirements) body.requirements = nextReq

  const nextSkills = next.skills ?? []
  if (JSON.stringify(nextSkills) !== JSON.stringify(original.skills)) body.skills = nextSkills

  const nextDeadline = next.applicationDeadline ?? null
  if (nextDeadline !== original.applicationDeadline) body.applicationDeadline = nextDeadline

  const nextRefName = next.referenceName ?? ''
  if (nextRefName !== (original.referenceName ?? '')) body.referenceName = nextRefName
  const nextRefEmail = next.referenceEmail ?? ''
  if (nextRefEmail !== (original.referenceEmail ?? '').toLowerCase()) {
    body.referenceEmail = nextRefEmail
  }

  if (next.status !== original.status) body.status = next.status

  if (Object.keys(body).length === 0) {
    return { body: {}, errors: { form: 'Change at least one field before saving.' } }
  }

  return { body, errors: {} }
}
