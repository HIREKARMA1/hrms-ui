import type { Dispatch, SetStateAction } from 'react'

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

import type { Candidate, JobPosting } from '../types/recruitment'
import {
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  type InterviewFormState,
} from '../utils/interviewForm'
import type { InterviewStatus, InterviewType } from '../types/recruitment'

type InterviewScheduleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: InterviewFormState
  setForm: Dispatch<SetStateAction<InterviewFormState>>
  editingId: string | null
  candidates: Candidate[]
  jobs: JobPosting[]
  onSave: () => void
  lockJobId?: string
  lockCandidateId?: string
}

export function InterviewScheduleDialog({
  open,
  onOpenChange,
  form,
  setForm,
  editingId,
  candidates,
  jobs,
  onSave,
  lockJobId,
  lockCandidateId,
}: InterviewScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Interview' : 'Schedule Interview'}
          </DialogTitle>
          <DialogDescription>
            Saved interviews appear on Interview Scheduling for this session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Candidate</Label>
            <Select
              value={form.candidateId}
              disabled={Boolean(lockCandidateId)}
              onValueChange={(v) => {
                const c = candidates.find((x) => x.id === v)
                setForm((f) => ({
                  ...f,
                  candidateId: v,
                  jobId: lockJobId ?? c?.appliedJobId ?? f.jobId,
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
              disabled={Boolean(lockJobId)}
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
                {INTERVIEW_TYPES.map((t) => (
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
                {INTERVIEW_STATUSES.map((s) => (
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}