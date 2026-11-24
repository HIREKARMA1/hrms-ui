/**
 * Create / edit job posting using production DTOs.
 * Edit excludes description (use JobDescriptionDialog).
 */
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateJobMutation, useUpdateJobMutation } from '../../api/jobsApi'
import type {
  BackendJob,
  JobEmploymentType,
  JobPostingStatus,
  JobWorkMode,
} from '../../api/jobsApi.types'
import type { JobFormErrors, JobFormValues } from '../../utils/jobFormValidation'
import {
  createSubmitGuard,
  submitCreateJob,
  submitUpdateJob,
} from '../../utils/jobMutations'

const EMPLOYMENT_TYPES: JobEmploymentType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
]
const WORK_MODES: JobWorkMode[] = ['ONSITE', 'REMOTE', 'HYBRID']
const STATUSES: JobPostingStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']

function emptyValues(): JobFormValues {
  return {
    title: '',
    departmentId: '',
    employmentType: 'FULL_TIME',
    location: '',
    workMode: 'HYBRID',
    openings: '1',
    minExperienceYears: '',
    maxExperienceYears: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    description: '',
    requirements: '',
    skillsText: '',
    applicationDeadline: '',
    status: 'DRAFT',
  }
}

function valuesFromJob(job: BackendJob): JobFormValues {
  return {
    title: job.title,
    departmentId: job.departmentId ?? '',
    employmentType: job.employmentType,
    location: job.location,
    workMode: job.workMode,
    openings: String(job.openings),
    minExperienceYears: job.minExperienceYears?.toString() ?? '',
    maxExperienceYears: job.maxExperienceYears?.toString() ?? '',
    salaryMin: job.salaryMin?.toString() ?? '',
    salaryMax: job.salaryMax?.toString() ?? '',
    salaryCurrency: job.salaryCurrency ?? 'INR',
    description: job.description,
    requirements: job.requirements ?? '',
    skillsText: job.skills.join(', '),
    applicationDeadline: job.applicationDeadline ?? '',
    status: job.status,
  }
}

type JobFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  job: BackendJob | null
  onOpenChange: (open: boolean) => void
  onSaved: (job: BackendJob, mode: 'create' | 'edit') => void
}

function JobFormFields({
  mode,
  job,
  onOpenChange,
  onSaved,
}: {
  mode: 'create' | 'edit'
  job: BackendJob | null
  onOpenChange: (open: boolean) => void
  onSaved: (job: BackendJob, mode: 'create' | 'edit') => void
}) {
  const [createJob] = useCreateJobMutation()
  const [updateJob] = useUpdateJobMutation()
  const [values, setValues] = useState<JobFormValues>(() =>
    mode === 'edit' && job ? valuesFromJob(job) : emptyValues(),
  )
  const [errors, setErrors] = useState<JobFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const setField = <K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)

    const outcome =
      mode === 'create'
        ? await submitCreateJob({
            values,
            guard,
            send: (body) => createJob(body),
          })
        : job
          ? await submitUpdateJob({
              id: job.id,
              values,
              original: job,
              guard,
              send: (arg) => updateJob(arg),
            })
          : { status: 'error' as const, message: 'Job not found.' }

    setSubmitting(false)

    if (outcome.status === 'busy') return
    if (outcome.status === 'invalid') {
      setErrors(outcome.errors)
      return
    }
    if (outcome.status === 'error') {
      setFormError(outcome.message)
      return
    }

    onSaved(outcome.job, mode)
    onOpenChange(false)
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="job-title">Title</Label>
          <Input
            id="job-title"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            disabled={submitting}
          />
          {errors.title ? <p className="text-xs text-red-500">{errors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-department">Department ID (optional)</Label>
          <Input
            id="job-department"
            value={values.departmentId}
            onChange={(e) => setField('departmentId', e.target.value)}
            disabled={submitting}
            placeholder="Server department id"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) => setField('status', value as JobPostingStatus)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Employment type</Label>
          <Select
            value={values.employmentType || undefined}
            onValueChange={(value) => setField('employmentType', value as JobEmploymentType)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employmentType ? (
            <p className="text-xs text-red-500">{errors.employmentType}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Work mode</Label>
          <Select
            value={values.workMode || undefined}
            onValueChange={(value) => setField('workMode', value as JobWorkMode)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {WORK_MODES.map((modeOption) => (
                <SelectItem key={modeOption} value={modeOption}>
                  {modeOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.workMode ? <p className="text-xs text-red-500">{errors.workMode}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-location">Location</Label>
          <Input
            id="job-location"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            disabled={submitting}
          />
          {errors.location ? <p className="text-xs text-red-500">{errors.location}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-openings">Openings</Label>
          <Input
            id="job-openings"
            inputMode="numeric"
            value={values.openings}
            onChange={(e) => setField('openings', e.target.value)}
            disabled={submitting}
          />
          {errors.openings ? <p className="text-xs text-red-500">{errors.openings}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-min-exp">Min experience (years)</Label>
          <Input
            id="job-min-exp"
            inputMode="decimal"
            value={values.minExperienceYears}
            onChange={(e) => setField('minExperienceYears', e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-max-exp">Max experience (years)</Label>
          <Input
            id="job-max-exp"
            inputMode="decimal"
            value={values.maxExperienceYears}
            onChange={(e) => setField('maxExperienceYears', e.target.value)}
            disabled={submitting}
          />
          {errors.experience ? <p className="text-xs text-red-500">{errors.experience}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-sal-min">Salary min</Label>
          <Input
            id="job-sal-min"
            inputMode="decimal"
            value={values.salaryMin}
            onChange={(e) => setField('salaryMin', e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-sal-max">Salary max</Label>
          <Input
            id="job-sal-max"
            inputMode="decimal"
            value={values.salaryMax}
            onChange={(e) => setField('salaryMax', e.target.value)}
            disabled={submitting}
          />
          {errors.salary ? <p className="text-xs text-red-500">{errors.salary}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-currency">Currency</Label>
          <Input
            id="job-currency"
            value={values.salaryCurrency}
            maxLength={3}
            onChange={(e) => setField('salaryCurrency', e.target.value.toUpperCase())}
            disabled={submitting}
          />
          {errors.salaryCurrency ? (
            <p className="text-xs text-red-500">{errors.salaryCurrency}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-deadline">Application deadline</Label>
          <Input
            id="job-deadline"
            type="date"
            value={values.applicationDeadline}
            onChange={(e) => setField('applicationDeadline', e.target.value)}
            disabled={submitting}
          />
          {errors.applicationDeadline ? (
            <p className="text-xs text-red-500">{errors.applicationDeadline}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="job-skills">Skills (comma-separated)</Label>
          <Input
            id="job-skills"
            value={values.skillsText}
            onChange={(e) => setField('skillsText', e.target.value)}
            disabled={submitting}
          />
          {errors.skills ? <p className="text-xs text-red-500">{errors.skills}</p> : null}
        </div>

        {mode === 'create' ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              rows={5}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              disabled={submitting}
            />
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="job-requirements">Requirements</Label>
          <Textarea
            id="job-requirements"
            rows={4}
            value={values.requirements}
            onChange={(e) => setField('requirements', e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {errors.form ? <p className="text-xs text-red-500">{errors.form}</p> : null}
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {formError}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : mode === 'create' ? (
            'Create job'
          ) : (
            'Save changes'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function JobFormDialog({
  open,
  mode,
  job,
  onOpenChange,
  onSaved,
}: JobFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create job posting' : 'Edit job posting'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Required fields: title, employment type, location, work mode, and description.'
              : 'Description is edited in a separate dialog. Other fields can be updated here.'}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <JobFormFields
            key={`${mode}:${job?.id ?? 'new'}:${job?.updatedAt ?? '0'}`}
            mode={mode}
            job={job}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
