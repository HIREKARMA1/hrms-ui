import { Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import { useGetJobQuery } from '../../api/jobsApi'
import {
  formatEmploymentType,
  formatExperience,
  formatPostedDate,
  formatWorkMode,
} from '../../utils/jobFormat'
import { ApiJobStatusBadge } from './ApiJobStatusBadge'

type JobDetailDialogProps = {
  jobId: string | null
  onOpenChange: (open: boolean) => void
  onEdit: (jobId: string) => void
  onEditDescription: (jobId: string) => void
  canManage: boolean
}

export function JobDetailDialog({
  jobId,
  onOpenChange,
  onEdit,
  onEditDescription,
  canManage,
}: JobDetailDialogProps) {
  const open = Boolean(jobId)
  const detail = useGetJobQuery(jobId ?? '', {
    skip: !jobId,
    refetchOnMountOrArgChange: true,
  })
  const job = detail.data
  const notFound = detail.isError && (detail.error as { status?: unknown })?.status === 404

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Job details</DialogTitle>
          <DialogDescription>Loaded from the recruitment jobs API for this id.</DialogDescription>
        </DialogHeader>

        {!jobId ? null : detail.isLoading || (detail.isFetching && !job) ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : notFound ? (
          <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Job not found.
          </p>
        ) : detail.isError ? (
          <div className="space-y-3">
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(detail.error, 'Could not load this job.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void detail.refetch()}>
              {detail.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Retrying...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </div>
        ) : job ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ApiJobStatusBadge status={job.status} />
              <Badge variant={job.isActive ? 'success' : 'secondary'}>
                {job.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{formatEmploymentType(job.employmentType)}</Badge>
              <Badge variant="secondary">{formatWorkMode(job.workMode)}</Badge>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-navy">{job.title}</h3>
              <p className="text-xs text-slate-500 break-all">{job.id}</p>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Reference Name</dt>
                <dd>{job.referenceName?.trim() ? job.referenceName : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Reference Email</dt>
                <dd className="break-all">
                  {job.referenceEmail?.trim() ? job.referenceEmail : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Department</dt>
                <dd>{job.department?.name ?? job.departmentId ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
                <dd>{job.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Experience</dt>
                <dd>{formatExperience(job.minExperienceYears, job.maxExperienceYears)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Openings</dt>
                <dd>{job.openings}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Applications</dt>
                <dd>{job.applicationCount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Posted</dt>
                <dd>{formatPostedDate(job.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Deadline</dt>
                <dd>{job.applicationDeadline ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Salary</dt>
                <dd>
                  {job.salaryMin === null && job.salaryMax === null
                    ? '—'
                    : `${job.salaryCurrency ?? ''} ${job.salaryMin ?? '—'} – ${job.salaryMax ?? '—'}`.trim()}
                </dd>
              </div>
            </dl>

            {job.skills.length ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Description</p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
            </div>

            {job.requirements ? (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Requirements</p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{job.requirements}</p>
              </div>
            ) : null}

            {job.history.length ? (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Recent history</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {job.history.slice(0, 8).map((entry, index) => (
                    <li key={entry.id ?? `${entry.action}-${index}`}>
                      {entry.action ?? 'Event'}
                      {entry.createdAt ? ` · ${formatPostedDate(entry.createdAt)}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {canManage ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => onEditDescription(job.id)}>
                    Edit description
                  </Button>
                  <Button type="button" onClick={() => onEdit(job.id)}>
                    Edit job
                  </Button>
                </div>
              ) : null}
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
