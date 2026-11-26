import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { Feature } from '@/features/rbac/components/Feature'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useListApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '../api/applicationsApi'
import type { ApplicationStatus, BackendApplication } from '../api/applicationsApi.types'
import { JOBS_PAGE_SIZE, useListJobsQuery } from '../api/jobsApi'
import { ApplicationStatusBadge, RecruitmentPageShell } from '../components'
import { RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import { formatApplicationStatus } from '../utils/applicationFormat'
import { getAllowedNextStatuses, PIPELINE_STAGES } from '../utils/pipeline'
import { PIPELINE_STAGE_STYLES } from '../utils/pipelineStageStyle'

export function ApplicationPipelinePage() {
  const [jobFilter, setJobFilter] = useState('__all__')
  const [dateFrom, setDateFrom] = useState('')
  const [selected, setSelected] = useState<BackendApplication | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updateStatus] = useUpdateApplicationStatusMutation()

  const jobsQuery = useListJobsQuery({ page: 1, limit: JOBS_PAGE_SIZE, isActive: true })
  const list = useListApplicationsQuery({
    page: 1,
    limit: 100,
    ...(jobFilter !== '__all__' ? { jobPostingId: jobFilter } : {}),
    sortBy: 'appliedAt',
    sortOrder: 'desc',
  })

  const filtered = useMemo(() => {
    return (list.data?.items ?? []).filter((app) => {
      if (dateFrom && app.appliedAt && app.appliedAt.slice(0, 10) < dateFrom) return false
      return true
    })
  }, [list.data, dateFrom])

  const byStage = useMemo(() => {
    const map = Object.fromEntries(
      PIPELINE_STAGES.map((stage) => [stage, [] as BackendApplication[]]),
    ) as Record<ApplicationStatus, BackendApplication[]>
    for (const app of filtered) {
      map[app.status]?.push(app)
    }
    return map
  }, [filtered])

  const changeStatus = async (applicationId: string, next: ApplicationStatus) => {
    setError(null)
    try {
      const updated = await updateStatus({
        id: applicationId,
        body: { status: next },
      }).unwrap()
      setSelected((prev) => (prev && prev.id === applicationId ? updated : prev))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update application status.'))
    }
  }

  return (
    <RecruitmentPageShell
      activeSection="Application Pipeline"
      wide
      trailing={
        <Button
          type="button"
          variant="outline"
          onClick={() => void list.refetch()}
          disabled={list.isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className={RECRUITMENT_FILTER_BAR}>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All jobs</SelectItem>
            {(jobsQuery.data?.items ?? []).map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-full lg:w-44"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Applications from date"
        />
      </div>

      {list.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : list.isError ? (
        <div className="space-y-3 rounded-2xl border border-border-soft bg-white p-6">
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(list.error, 'Could not load applications.')}
          </p>
          <Button type="button" variant="outline" onClick={() => void list.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage}
              className={cn(
                'w-[260px] shrink-0 rounded-2xl border border-[#E2E6EF] bg-white shadow-sm',
                'border-t-4',
                PIPELINE_STAGE_STYLES[stage].column,
              )}
            >
              <div className="flex items-center justify-between border-b border-[#E2E6EF] px-3 py-3">
                <p className="text-sm font-semibold text-[#17213A]">
                  {formatApplicationStatus(stage)}
                </p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    PIPELINE_STAGE_STYLES[stage].accent,
                  )}
                >
                  {byStage[stage].length}
                </span>
              </div>
              <ul className="space-y-2 p-3">
                {byStage[stage].map((app) => {
                  const nextStages = getAllowedNextStatuses(app.status)
                  return (
                    <li
                      key={app.id}
                      className="rounded-xl border border-border-soft bg-white p-3 shadow-sm"
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setSelected(app)}
                      >
                        <p className="font-medium text-navy">
                          {app.candidate?.fullName ?? app.candidateId}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {app.jobPosting?.title ?? app.jobPostingId}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {app.appliedAt?.slice(0, 10) ?? '—'}
                        </p>
                      </button>
                      <Feature name="recruitment.manage">
                        {nextStages.length > 0 ? (
                          <Select
                            key={`${app.id}-${app.status}`}
                            onValueChange={(v) =>
                              void changeStatus(app.id, v as ApplicationStatus)
                            }
                          >
                            <SelectTrigger className="mt-2 h-8 text-xs">
                              <SelectValue placeholder="Move status" />
                            </SelectTrigger>
                            <SelectContent>
                              {nextStages.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {formatApplicationStatus(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-2 text-xs text-text-secondary">Terminal status</p>
                        )}
                      </Feature>
                    </li>
                  )
                })}
                {byStage[stage].length === 0 ? (
                  <li className="rounded-xl border border-dashed border-border-soft px-3 py-6 text-center text-xs text-text-secondary">
                    No applications
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected?.candidate?.fullName ?? 'Application'}
            </DialogTitle>
            <DialogDescription>
              {selected?.jobPosting?.title ?? selected?.jobPostingId} ·{' '}
              {selected?.candidate?.email ?? selected?.candidateId}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy">Current status:</span>
                <ApplicationStatusBadge status={selected.status} />
              </div>
              <p>Applied {selected.appliedAt?.slice(0, 10) ?? '—'}</p>
              <Feature name="recruitment.manage">
                <div className="flex flex-wrap gap-2">
                  {getAllowedNextStatuses(selected.status).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void changeStatus(selected.id, s)}
                    >
                      Move to {formatApplicationStatus(s)}
                    </Button>
                  ))}
                </div>
              </Feature>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}