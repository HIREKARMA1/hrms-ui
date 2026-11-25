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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { useUpdateJobDescriptionMutation } from '../../api/jobsApi'
import type { BackendJob } from '../../api/jobsApi.types'
import { createSubmitGuard, submitUpdateJobDescription } from '../../utils/jobMutations'

type JobDescriptionDialogProps = {
  job: BackendJob | null
  onOpenChange: (open: boolean) => void
  onSaved: (job: BackendJob) => void
}

function DescriptionForm({
  job,
  onOpenChange,
  onSaved,
}: {
  job: BackendJob
  onOpenChange: (open: boolean) => void
  onSaved: (job: BackendJob) => void
}) {
  const { canAccess } = useOptionalFeatureAccess()
  const canManage = canAccess('recruitment.manage')
  const [updateDescription] = useUpdateJobDescriptionMutation()
  const [description, setDescription] = useState(job.description)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canManage) {
      setError('You do not have permission to edit job descriptions.')
      return
    }
    setError(null)
    setSubmitting(true)
    const outcome = await submitUpdateJobDescription({
      id: job.id,
      description,
      originalDescription: job.description,
      guard,
      send: (arg) => updateDescription(arg),
    })
    setSubmitting(false)

    if (outcome.status === 'busy') return
    if (outcome.status === 'unchanged') {
      onOpenChange(false)
      return
    }
    if (outcome.status === 'invalid' || outcome.status === 'error') {
      setError(outcome.message)
      return
    }
    onSaved(outcome.job)
    onOpenChange(false)
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="job-desc-edit">Description</Label>
        <Textarea
          id="job-desc-edit"
          rows={8}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
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
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save description'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function JobDescriptionDialog({
  job,
  onOpenChange,
  onSaved,
}: JobDescriptionDialogProps) {
  return (
    <Dialog
      open={Boolean(job)}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update job description</DialogTitle>
          <DialogDescription>
            {job ? `Description for ${job.title}. Unchanged text is not sent.` : 'Edit description.'}
          </DialogDescription>
        </DialogHeader>

        {job ? (
          <DescriptionForm
            key={`${job.id}:${job.updatedAt ?? job.description}`}
            job={job}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
