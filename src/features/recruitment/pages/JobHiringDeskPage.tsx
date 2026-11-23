import { ArrowLeft, CalendarDays, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

import { JobHiringCandidateDialog } from '../components/hiringDesk/JobHiringCandidateDialog'
import { InterviewScheduleDialog } from '../components/InterviewScheduleDialog'
import {
  InterviewStatusBadge,
  JobStatusBadge,
  RecruitmentPageShell,
  StageBadge,
} from '../components'
import { RECRUITMENT_FILTER_BAR, RECRUITMENT_TABLE_SHELL } from '../components/shared/recruitmentUi'
import { useRecruitment } from '../hooks/useRecruitment'
import type { Candidate, Interview, PipelineStage } from '../types/recruitment'
import { getSuggestedRounds } from '../utils/expectedRounds'
import {
  interviewsForCandidateOnJob,
  nextScheduledInterview,
} from '../utils/hiringDeskUtils'
import {
  emptyInterviewForm,
  interviewToForm,
  type InterviewFormState,
} from '../utils/interviewForm'
import { recruitmentRoutePrefix } from '../utils/recruitmentRoutes'
import { PIPELINE_STAGES } from '../utils/pipeline'

export function JobHiringDeskPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const location = useLocation()
  const prefix = recruitmentRoutePrefix(location.pathname)
  const { jobs, candidates, interviews, upsertInterview } = useRecruitment()

  const job = jobs.find((j) => j.id === jobId)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [sheetCandidate, setSheetCandidate] = useState<Candidate | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<InterviewFormState>(emptyInterviewForm)

  const jobCandidates = useMemo(
    () => candidates.filter((c) => c.appliedJobId === jobId),
    [candidates, jobId],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobCandidates.filter((c) => {
      if (stageFilter !== 'All' && c.stage !== stageFilter) return false
      if (!q) return true
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    })
  }, [jobCandidates, search, stageFilter])

  const jobInterviews = useMemo(
    () => interviews.filter((i) => i.jobId === jobId),
    [interviews, jobId],
  )

  const suggested = job ? getSuggestedRounds(job.employmentType) : []

  const inInterviewCount = jobCandidates.filter((c) =>
    ['Interview', 'Selected', 'Offer Released'].includes(c.stage),
  ).length

  const openSchedule = (candidate: Candidate, seedRound?: string) => {
    setEditingId(null)
    setForm({
      ...emptyInterviewForm,
      candidateId: candidate.id,
      jobId: jobId ?? '',
      round: seedRound ?? 'Technical Round 1',
    })
    setFormOpen(true)
  }

  const openEdit = (interview: Interview) => {
    setEditingId(interview.id)
    setForm(interviewToForm(interview))
    setFormOpen(true)
  }

  const saveInterview = () => {
    upsertInterview(editingId, form)
    setFormOpen(false)
  }

  if (!jobId) return <Navigate to={`/${prefix}/recruitment/jobs`} replace />
  if (!job) {
    return (
      <RecruitmentPageShell activeSection="Hiring desk">
        <p className="text-sm text-[#667085]">Job not found.</p>
        <Button type="button" variant="outline" asChild>
          <Link to={`/${prefix}/recruitment/jobs`}>Back to Job Postings</Link>
        </Button>
      </RecruitmentPageShell>
    )
  }

  const sheetRounds = sheetCandidate
    ? interviewsForCandidateOnJob(interviews, jobId, sheetCandidate.id)
    : []

  return (
    <RecruitmentPageShell
      activeSection="Hiring desk"
      trailing={
        <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
          <Link to={`/${prefix}/recruitment/jobs`}>
            <ArrowLeft className="h-4 w-4" />
            Job Postings
          </Link>
        </Button>
      }
    >
      <div className="rounded-2xl border border-[#E2E6EF] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#17213A]">{job.title}</h2>
            <p className="mt-1 text-sm text-[#667085]">
              {job.department} · {job.location} · {job.employmentType}
            </p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E6EF] bg-[#F7F8FC] px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-[#667085]">
              <Users className="h-3.5 w-3.5" />
              Applicants
            </p>
            <p className="text-2xl font-bold text-[#17213A]">{jobCandidates.length}</p>
          </div>
          <div className="rounded-xl border border-[#E2E6EF] bg-[#F7F8FC] px-4 py-3">
            <p className="text-xs font-medium text-[#667085]">In interview loop</p>
            <p className="text-2xl font-bold text-[#17213A]">{inInterviewCount}</p>
          </div>
          <div className="rounded-xl border border-[#E2E6EF] bg-[#F7F8FC] px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-[#667085]">
              <CalendarDays className="h-3.5 w-3.5" />
              Interviews (this job)
            </p>
            <p className="text-2xl font-bold text-[#17213A]">{jobInterviews.length}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
            Suggested path (soft)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggested.map((step, index) => (
              <span
                key={step.label}
                className="inline-flex items-center gap-1 text-sm text-[#17213A]"
              >
                {index > 0 ? (
                  <span className="text-[#667085]" aria-hidden>
                    →
                  </span>
                ) : null}
                <Badge variant="secondary">{step.label}</Badge>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={RECRUITMENT_FILTER_BAR}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            className="pl-9"
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" asChild>
          <Link to={`/${prefix}/recruitment/interviews?jobId=${encodeURIComponent(jobId)}`}>
            Open Interview Scheduling
          </Link>
        </Button>
      </div>

      <div className={RECRUITMENT_TABLE_SHELL}>
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E6EF] bg-[#FAFBFD]">
              <TableHead>Candidate</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Rounds</TableHead>
              <TableHead>Next interview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const rounds = interviewsForCandidateOnJob(interviews, jobId, c.id)
              const next = nextScheduledInterview(rounds)
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-[#17213A]">{c.fullName}</p>
                    <p className="text-xs text-[#667085]">{c.email}</p>
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={c.stage as PipelineStage} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {rounds.length}
                    <span className="text-[#667085]"> / {suggested.length} suggested</span>
                  </TableCell>
                  <TableCell>
                    {next ? (
                      <div className="text-sm">
                        <p className="font-medium text-[#17213A]">{next.round}</p>
                        <p className="text-xs text-[#667085]">
                          {next.date} · {next.startTime}
                        </p>
                        <InterviewStatusBadge status={next.status} />
                      </div>
                    ) : (
                      <span className="text-sm text-[#667085]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Feature name="recruitment.manage">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSheetCandidate(c)
                        }}
                      >
                        Manage rounds
                      </Button>
                    </Feature>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-[#667085]">
                  No applicants match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <JobHiringCandidateDialog
        open={Boolean(sheetCandidate)}
        onOpenChange={(open) => !open && setSheetCandidate(null)}
        candidate={sheetCandidate}
        jobTitle={job.title}
        rounds={sheetRounds}
        suggestedRounds={suggested}
        onSchedule={() => {
          if (sheetCandidate) openSchedule(sheetCandidate)
        }}
        onEdit={(item) => openEdit(item)}
      />

      <InterviewScheduleDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        editingId={editingId}
        candidates={jobCandidates}
        jobs={[job]}
        lockJobId={jobId}
        lockCandidateId={form.candidateId || undefined}
        onSave={saveInterview}
      />
    </RecruitmentPageShell>
  )
}