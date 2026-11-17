import { Pencil, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { InterviewScheduleDialog } from '../components/InterviewScheduleDialog'
import { InterviewStatusBadge, RecruitmentPageShell } from '../components'
import { RECRUITMENT_FILTER_BAR, RECRUITMENT_INFO_NOTE } from '../components/shared/recruitmentUi'
import { useRecruitment } from '../hooks/useRecruitment'
import type { Interview } from '../types/recruitment'
import {
  emptyInterviewForm,
  interviewToForm,
  type InterviewFormState,
} from '../utils/interviewForm'

export function InterviewSchedulingPage() {
  const { candidates, jobs, interviews, upsertInterview, cancelInterview } =
    useRecruitment()
  const [searchParams, setSearchParams] = useSearchParams()
  const jobFromUrl = searchParams.get('jobId')
  const [candidateFilter, setCandidateFilter] = useState('All')
  const [jobFilter, setJobFilter] = useState<string>(jobFromUrl ?? 'All')
  const [interviewerFilter, setInterviewerFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<InterviewFormState>(emptyInterviewForm)

  useEffect(() => {
    if (jobFromUrl) setJobFilter(jobFromUrl)
  }, [jobFromUrl])

  const filtered = useMemo(() => {
    return interviews.filter((item) => {
      if (jobFilter !== 'All' && item.jobId !== jobFilter) return false
      if (candidateFilter !== 'All' && item.candidateId !== candidateFilter)
        return false
      if (statusFilter !== 'All' && item.status !== statusFilter) return false
      if (dateFilter && item.date !== dateFilter) return false
      if (
        interviewerFilter.trim() &&
        !item.interviewers.some((name) =>
          name.toLowerCase().includes(interviewerFilter.trim().toLowerCase()),
        )
      ) {
        return false
      }
      return true
    })
  }, [
    interviews,
    jobFilter,
    candidateFilter,
    statusFilter,
    dateFilter,
    interviewerFilter,
  ])

  const activeJob = jobs.find((j) => j.id === jobFilter)

  const upcoming = filtered.filter((i) => i.status === 'Scheduled' || i.status === 'Rescheduled')
  const completed = filtered.filter((i) => i.status === 'Completed')

  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyInterviewForm,
      candidateId: candidates[0]?.id ?? '',
      jobId:
        jobFilter !== 'All'
          ? jobFilter
          : (candidates[0]?.appliedJobId ?? jobs[0]?.id ?? ''),
    })
    setFormOpen(true)
  }

  const openEdit = (item: Interview) => {
    setEditingId(item.id)
    setForm(interviewToForm(item))
    setFormOpen(true)
  }

  const saveInterview = () => {
    upsertInterview(editingId, form)
    setFormOpen(false)
  }

  const renderTable = (rows: Interview[]) => (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Date / Time</TableHead>
            <TableHead>Interviewers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-navy">
                {row.candidateName}
              </TableCell>
              <TableCell>{row.jobTitle}</TableCell>
              <TableCell>
                {row.round}
                <p className="text-xs text-text-secondary">{row.interviewType}</p>
              </TableCell>
              <TableCell>
                {row.date}
                <p className="text-xs text-text-secondary">
                  {row.startTime} – {row.endTime}
                </p>
              </TableCell>
              <TableCell className="max-w-[160px] text-sm text-text-secondary">
                {row.interviewers.join(', ')}
              </TableCell>
              <TableCell>
                <InterviewStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="text-right">
                <Feature name="recruitment.manage">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {row.status === 'Scheduled' || row.status === 'Rescheduled' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => cancelInterview(row.id)}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </Feature>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <RecruitmentPageShell
      activeSection="Interview Scheduling"
      trailing={
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </Feature>
      }
    >
      {jobFilter !== 'All' && activeJob ? (
        <div className={`${RECRUITMENT_INFO_NOTE} flex flex-wrap items-center justify-between gap-2`}>
          <span>
            Filtered to <strong className="text-[#17213A]">{activeJob.title}</strong>{' '}
            (from hiring desk).
          </span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[#5938DB]"
            onClick={() => {
              setJobFilter('All')
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
            <SelectItem value="All">All jobs</SelectItem>
            {jobs.map((job) => (
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
            <SelectItem value="All">All candidates</SelectItem>
            {candidates.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by interviewer"
          value={interviewerFilter}
          onChange={(e) => setInterviewerFilter(e.target.value)}
          className="lg:w-52"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="lg:w-44"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'] as const).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {renderTable(upcoming)}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderTable(completed)}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTable(filtered)}
        </TabsContent>
      </Tabs>

      <InterviewScheduleDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        editingId={editingId}
        candidates={candidates}
        jobs={jobs}
        onSave={saveInterview}
      />
    </RecruitmentPageShell>
  )
}
