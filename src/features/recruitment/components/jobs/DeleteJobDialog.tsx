import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useDeleteJobMutation } from '../../api/jobsApi'
import type { BackendJob } from '../../api/jobsApi.types'
import { createSubmitGuard, submitDeleteJob } from '../../utils/jobMutations'

type DeleteJobDialogProps = {
  job: BackendJob | null
  onOpenChange: (open: boolean) => void
  onDeleted: (job: BackendJob) => void
}

export function DeleteJobDialog({ job, onOpenChange, onDeleted }: DeleteJobDialogProps) {
  const [deleteJob] = useDeleteJobMutation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  const handleConfirm = async () => {
    if (!job) return
    setError(null)
    setSubmitting(true)
    const outcome = await submitDeleteJob({
      id: job.id,
      guard,
      send: (id) => deleteJob(id),
    })
    setSubmitting(false)
    if (outcome.status === 'busy') return
    if (outcome.status === 'error') {
      setError(outcome.message)
      return
    }
    onDeleted(job)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={Boolean(job)}
      onOpenChange={(next) => {
        if (submitting) return
        if (!next) setError(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate job posting</DialogTitle>
          <DialogDescription>
            {job ? (
              <>
                Soft-deactivate <strong>{job.title}</strong>? The API sets the posting inactive and
                preserves history. Hard delete is not performed when applications exist.
              </>
            ) : (
              'Confirm deactivation.'
            )}
          </DialogDescription>
        </DialogHeader>

        {job && job.applicationCount > 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This job has {job.applicationCount} application
            {job.applicationCount === 1 ? '' : 's'}. The server will soft-deactivate rather than
            permanently delete.
          </p>
        ) : null}

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
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            disabled={submitting || !job}
            onClick={() => void handleConfirm()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              'Deactivate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
