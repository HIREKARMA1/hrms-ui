import { createSubmitGuard, type SubmitGuard } from '@/features/auth/utils/passwordReset'

import { getJobErrorMessage } from '../api/jobsApi'
import type {
  BackendJob,
  CreateJobBody,
  UpdateJobBody,
  UpdateJobDescriptionBody,
} from '../api/jobsApi.types'
import {
  buildCreateJobBody,
  buildUpdateJobBody,
  validateCreateJobForm,
  type JobFormErrors,
  type JobFormValues,
} from './jobFormValidation'

export { createSubmitGuard }
export type { SubmitGuard }

export type JobMutationOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; errors: JobFormErrors }
  | { status: 'success'; job: BackendJob }
  | { status: 'error'; message: string }

export type DeleteJobOutcome =
  | { status: 'busy' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export type DescriptionOutcome =
  | { status: 'busy' }
  | { status: 'invalid'; message: string }
  | { status: 'unchanged' }
  | { status: 'success'; job: BackendJob }
  | { status: 'error'; message: string }

export async function submitCreateJob(input: {
  values: JobFormValues
  guard: SubmitGuard
  send: (body: CreateJobBody) => { unwrap: () => Promise<BackendJob> }
}): Promise<JobMutationOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const errors = validateCreateJobForm(input.values)
    if (Object.keys(errors).length) return { status: 'invalid', errors }
    const job = await input.send(buildCreateJobBody(input.values)).unwrap()
    return { status: 'success', job }
  } catch (error) {
    return { status: 'error', message: getJobErrorMessage(error, 'Could not create this job.') }
  } finally {
    input.guard.leave()
  }
}

export async function submitUpdateJob(input: {
  id: string
  values: JobFormValues
  original: BackendJob
  guard: SubmitGuard
  send: (arg: { id: string; body: UpdateJobBody }) => { unwrap: () => Promise<BackendJob> }
}): Promise<JobMutationOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const { body, errors } = buildUpdateJobBody(input.values, input.original)
    if (Object.keys(errors).length) return { status: 'invalid', errors }
    const job = await input.send({ id: input.id, body }).unwrap()
    return { status: 'success', job }
  } catch (error) {
    return { status: 'error', message: getJobErrorMessage(error, 'Could not update this job.') }
  } finally {
    input.guard.leave()
  }
}

export async function submitDeleteJob(input: {
  id: string
  guard: SubmitGuard
  send: (id: string) => { unwrap: () => Promise<unknown> }
}): Promise<DeleteJobOutcome> {
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    await input.send(input.id).unwrap()
    return { status: 'success' }
  } catch (error) {
    return { status: 'error', message: getJobErrorMessage(error, 'Could not deactivate this job.') }
  } finally {
    input.guard.leave()
  }
}

export async function submitUpdateJobDescription(input: {
  id: string
  description: string
  originalDescription: string
  guard: SubmitGuard
  send: (arg: { id: string; body: UpdateJobDescriptionBody }) => {
    unwrap: () => Promise<BackendJob>
  }
}): Promise<DescriptionOutcome> {
  const description = input.description.trim()
  if (!description) return { status: 'invalid', message: 'Description is required.' }
  if (description === input.originalDescription.trim()) return { status: 'unchanged' }
  if (description.length > 20000) {
    return { status: 'invalid', message: 'Description must be at most 20000 characters.' }
  }
  if (!input.guard.tryEnter()) return { status: 'busy' }
  try {
    const job = await input.send({ id: input.id, body: { description } }).unwrap()
    return { status: 'success', job }
  } catch (error) {
    return {
      status: 'error',
      message: getJobErrorMessage(error, 'Could not update the job description.'),
    }
  } finally {
    input.guard.leave()
  }
}
