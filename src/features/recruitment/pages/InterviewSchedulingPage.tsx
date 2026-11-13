import { Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { InterviewStatusBadge, MockDataBanner } from '../components'
import {
  listCandidates,
  listInterviews,
  listJobs,
} from '../services/recruitmentService'
import type {
  Interview,
  InterviewStatus,
  InterviewType,
} from '../types/recruitment'

type InterviewForm = {
  candidateId: string
  jobId: string
  round: string
  interviewType: InterviewType
  date: string
  startTime: string
  endTime: string
  interviewers: string
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus
}

const interviewTypes: InterviewType[] = [
  'Technical',
  'HR',
  'Managerial',
  'Final',
  'Cultural',
]

const statuses: InterviewStatus[] = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled',
]

const emptyForm: InterviewForm = {
  candidateId: '',
  jobId: '',
  round: 'Technical Round 1',
  interviewType: 'Technical',
  date: '',
  startTime: '10:00',
  endTime: '11:00',
  interviewers: '',
  meetingLink: '',
  location: 'Virtual',
  notes: '',
  status: 'Scheduled',
}

export function InterviewSchedulingPage() {
  const [interviews, setInterviews] = useState(() => listInterviews())
  const [candidates] = useState(() => listCandidates())
  const [jobs] = useState(() => listJobs())
  const [candidateFilter, setCandidateFilter] = useState('All')
  const [interviewerFilter, setInterviewerFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<InterviewForm>(emptyForm)

  const filtered = useMemo(() => {
    return interviews.filter((item) => {
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
  }, [interviews, candidateFilter, statusFilter, dateFilter, interviewerFilter])

  const upcoming = filtered.filter((i) => i.status === 'Scheduled' || i.status === 'Rescheduled')
  const completed = filtered.filter((i) => i.status === 'Completed')

  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      candidateId: candidates[0]?.id ?? '',
      jobId: candidates[0]?.appliedJobId ?? jobs[0]?.id ?? '',
    })
    setFormOpen(true)
  }

  const openEdit = (item: Interview) => {
    setEditingId(item.id)
    setForm({
      candidateId: item.candidateId,
      jobId: item.jobId,
      round: item.round,
      interviewType: item.interviewType,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      interviewers: item.interviewers.join(', '),
      meetingLink: item.meetingLink,
      location: item.location,
      notes: item.notes,
      status: item.status,
    })
    setFormOpen(true)
  }

  const saveInterview = () => {
    if (!form.candidateId || !form.date) return
    const candidate = candidates.find((c) => c.id === form.candidateId)
    const job = jobs.find((j) => j.id === form.jobId)
    const payload = {
      candidateId: form.candidateId,
      candidateName: candidate?.fullName ?? 'Unknown',
      jobId: form.jobId,
      jobTitle: job?.title ?? candidate?.appliedJobTitle ?? 'Unknown',
      round: form.round.trim(),
      interviewType: form.interviewType,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      interviewers: form.interviewers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      meetingLink: form.meetingLink.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      status: form.status,
    }

    if (editingId) {
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item,
        ),
      )
    } else {
      setInterviews((prev) => [
        { ...payload, id: `INT-${300 + prev.length + 1}` },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const cancelInterview = (id: string) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Cancelled' } : item,
      ),
    )
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Interview Scheduling
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Schedule rounds, assign interviewers, and track status.
          </p>
        </div>
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </Feature>
      </div>

      <MockDataBanner />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row">
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
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Interview' : 'Schedule Interview'}
            </DialogTitle>
            <DialogDescription>
              UI-only scheduling against mock data. No calendar invites are sent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) => {
                  const c = candidates.find((x) => x.id === v)
                  setForm((f) => ({
                    ...f,
                    candidateId: v,
                    jobId: c?.appliedJobId ?? f.jobId,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
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
                value={form.jobId}
                onValueChange={(v) => setForm((f) => ({ ...f, jobId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interview Round</Label>
              <Input
                value={form.round}
                onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select
                value={form.interviewType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    interviewType: v as InterviewType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interviewTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interview Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as InterviewStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Interviewer(s)</Label>
              <Input
                placeholder="Comma-separated names"
                value={form.interviewers}
                onChange={(e) =>
                  setForm((f) => ({ ...f, interviewers: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input
                value={form.meetingLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meetingLink: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveInterview}>
              Save Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
