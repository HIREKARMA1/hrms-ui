import { Pencil, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/errors'

import { CANDIDATES_PAGE_SIZE, useListCandidatesQuery } from '../api/candidatesApi'
import {
  INTERVIEWS_PAGE_SIZE,
  useCreateInterviewMutation,
  useListInterviewsQuery,
  useUpdateInterviewMutation,
} from '../api/interviewsApi'
import type { BackendInterview } from '../api/interviewsApi.types'
import { JOBS_PAGE_SIZE, useListJobsQuery } from '../api/jobsApi'
import { RecruitmentPageShell } from '../components'
import { RECRUITMENT_FILTER_BAR, RECRUITMENT_INFO_NOTE } from '../components/shared/recruitmentUi'
import { getInterviewErrorMessage } from '../api/interviewsApi'

type InterviewForm = {
  candidateId: string
  jobPostingId: string
  round: string
  scheduledAt: string
  endAt: string
  location: string
  meetingLink: string
  notes: string
  status: string
}

const emptyForm: InterviewForm = {
  candidateId: '',
  jobPostingId: '',
  round: 'Round 1',
  scheduledAt: '',
  endAt: '',
  location: '',
  meetingLink: '',
  notes: '',
  status: 'SCHEDULED',
}

function interviewToForm(item: BackendInterview): InterviewForm {
  return {
    candidateId: item.candidateId ?? '',
    jobPostingId: item.jobPostingId ?? '',
    round: item.round ?? '',
    scheduledAt: item.scheduledAt?.slice(0, 16) ?? '',
    endAt: item.endAt?.slice(0, 16) ?? '',
    location: item.location ?? '',
    meetingLink: item.meetingLink ?? '',
    notes: item.notes ?? '',
    status: item.status ?? 'SCHEDULED',
  }
}

export function InterviewSchedulingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const jobFromUrl = searchParams.get('jobId')
  const [candidateFilter, setCandidateFilter] = useState('__all__')
  const [jobFilter, setJobFilter] = useState(jobFromUrl ?? '__all__')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('__all__')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BackendInterview | null>(null)
  const [form, setForm] = useState<InterviewForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (jobFromUrl) setJobFilter(jobFromUrl)
  }, [jobFromUrl])

  const list = useListInterviewsQuery({
    page: 1,
    limit: INTERVIEWS_PAGE_SIZE,
    ...(jobFilter !== '__all__' ? { jobPostingId: jobFilter } : {}),
    ...(candidateFilter !== '__all__' ? { candidateId: candidateFilter } : {}),
    ...(statusFilter !== '__all__' ? { status: statusFilter } : {}),
    ...(dateFilter ? { from: dateFilter, to: dateFilter } : {}),
  })
  const candidatesQuery = useListCandidatesQuery({ page: 1, limit: CANDIDATES_PAGE_SIZE })
  const jobsQuery = useListJobsQuery({ page: 1, limit: JOBS_PAGE_SIZE, isActive: true })
  const [createInterview] = useCreateInterviewMutation()
  const [updateInterview] = useUpdateInterviewMutation()

  const filtered = list.data?.items ?? []
  const activeJob = (jobsQuery.data?.items ?? []).find((j) => j.id === jobFilter)

  const openCreate = () => {
    const candidates = candidatesQuery.data?.items ?? []
    const jobs = jobsQuery.data?.items ?? []
    setEditing(null)
    setForm({
      ...emptyForm,
      candidateId: candidates[0]?.id ?? '',
      jobPostingId:
        jobFilter !== '__all__' ? jobFilter : (jobs[0]?.id ?? ''),
    })
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (item: BackendInterview) => {
    setEditing(item)
    setForm(interviewToForm(item))
    setFormError(null)
    setFormOpen(true)
  }

  const saveInterview = async () => {
    if (!form.candidateId || !form.scheduledAt) {
      setFormError('Candidate and scheduled date/time are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    const body = {
      candidateId: form.candidateId,
      jobPostingId: form.jobPostingId || undefined,
      round: form.round || undefined,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
      location: form.location || undefined,
      meetingLink: form.meetingLink || undefined,
      notes: form.notes || undefined,
    }
    try {
      if (editing) {
        await updateInterview({
          id: editing.id,
          body: { ...body, status: form.status || undefined },
        }).unwrap()
      } else {
        await createInterview(body).unwrap()
      }
      setFormOpen(false)
    } catch (error) {
      setFormError(getInterviewErrorMessage(error, 'Could not save interview.'))
    } finally {
      setSaving(false)
    }
  }

  const renderBody = () => {
    if (list.isLoading) return <Skeleton className="h-48 w-full" />
    if (list.isError) {
      return (
        <div className="space-y-3 p-6">
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(list.error, 'Could not load interviews.')}
          </p>
          <Button type="button" variant="outline" onClick={() => void list.refetch()}>
            Retry
          </Button>
        </div>
      )
    }
    if (filtered.length === 0) {
      return <p className="p-8 text-center text-sm text-slate-500">No interviews scheduled.</p>
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Interviewers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-navy">
                {row.candidateName ?? row.candidateId}
              </TableCell>
              <TableCell>{row.jobTitle ?? row.jobPostingId}</TableCell>
              <TableCell>{row.round ?? '—'}</TableCell>
              <TableCell>{row.scheduledAt?.replace('T', ' ') ?? '—'}</TableCell>
              <TableCell className="max-w-[160px] text-sm text-text-secondary">
                {row.interviewerNames.join(', ') || '—'}
              </TableCell>
              <TableCell>{row.status ?? '—'}</TableCell>
              <TableCell className="text-right">
                <Feature name="recruitment.manage">
                  <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Feature>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <RecruitmentPageShell
      activeSection="Interview Scheduling"
      trailing={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Feature name="recruitment.manage">
            <Button type="button" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Schedule Interview
            </Button>
          </Feature>
        </div>
      }
    >
      {jobFilter !== '__all__' && activeJob ? (
        <div className={`${RECRUITMENT_INFO_NOTE} flex flex-wrap items-center justify-between gap-2`}>
          <span>
            Filtered to <strong className="text-[#17213A]">{activeJob.title}</strong>.
          </span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[#5938DB]"
            onClick={() => {
              setJobFilter('__all__')
              setSearchParams({})
            }}
          >
            Clear job filter
          </Button>
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
        <Select value={candidateFilter} onValueChange={setCandidateFilter}>
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Candidate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All candidates</SelectItem>
            {(candidatesQuery.data?.items ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <Input
          placeholder="Status filter"
          value={statusFilter === '__all__' ? '' : statusFilter}
          onChange={(e) => setStatusFilter(e.target.value.trim() || '__all__')}
          className="lg:w-44"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {renderBody()}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle>
            <DialogDescription>Production `/recruitment/interviews` API.</DialogDescription>
          </DialogHeader>
          {formError ? (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) => setForm((f) => ({ ...f, candidateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {(candidatesQuery.data?.items ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job</Label>
              <Select
                value={form.jobPostingId}
                onValueChange={(v) => setForm((f) => ({ ...f, jobPostingId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {(jobsQuery.data?.items ?? []).map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Round</Label>
              <Input
                value={form.round}
                onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Location / link</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Location"
              />
              <Input
                value={form.meetingLink}
                onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                placeholder="Meeting link"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Feature name="recruitment.manage">
              <Button type="button" onClick={() => void saveInterview()} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </Feature>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}