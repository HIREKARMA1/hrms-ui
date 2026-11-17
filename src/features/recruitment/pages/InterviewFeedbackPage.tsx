import { Plus } from 'lucide-react'
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

import { RecruitmentPageShell, RecommendationBadge } from '../components'
import {
  listCandidates,
  listFeedback,
  listInterviews,
} from '../services/recruitmentService'
import type { HireRecommendation } from '../types/recruitment'

const recommendations: HireRecommendation[] = [
  'Strong Hire',
  'Hire',
  'Hold',
  'Reject',
]

type FeedbackForm = {
  interviewId: string
  interviewer: string
  technicalRating: string
  communicationRating: string
  problemSolvingRating: string
  overallRating: string
  recommendation: HireRecommendation
  comments: string
}

const emptyForm: FeedbackForm = {
  interviewId: '',
  interviewer: '',
  technicalRating: '3',
  communicationRating: '3',
  problemSolvingRating: '3',
  overallRating: '3',
  recommendation: 'Hold',
  comments: '',
}

export function InterviewFeedbackPage() {
  const [feedback, setFeedback] = useState(() => listFeedback())
  const [interviews] = useState(() => listInterviews())
  const [candidates] = useState(() => listCandidates())
  const [candidateFilter, setCandidateFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FeedbackForm>(emptyForm)

  const filtered = useMemo(() => {
    if (candidateFilter === 'All') return feedback
    return feedback.filter((f) => f.candidateId === candidateFilter)
  }, [feedback, candidateFilter])

  const historyByCandidate = useMemo(() => {
    const map = new Map<string, typeof feedback>()
    for (const item of feedback) {
      const list = map.get(item.candidateId) ?? []
      list.push(item)
      map.set(item.candidateId, list)
    }
    return map
  }, [feedback])

  const openCreate = () => {
    const first = interviews[0]
    setForm({
      ...emptyForm,
      interviewId: first?.id ?? '',
      interviewer: first?.interviewers[0] ?? '',
    })
    setFormOpen(true)
  }

  const saveFeedback = () => {
    const interview = interviews.find((i) => i.id === form.interviewId)
    if (!interview) return
    setFeedback((prev) => [
      {
        id: `FB-${400 + prev.length + 1}`,
        interviewId: interview.id,
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        jobTitle: interview.jobTitle,
        interviewer: form.interviewer.trim() || 'Interviewer',
        technicalRating: Number(form.technicalRating) || 0,
        communicationRating: Number(form.communicationRating) || 0,
        problemSolvingRating: Number(form.problemSolvingRating) || 0,
        overallRating: Number(form.overallRating) || 0,
        recommendation: form.recommendation,
        comments: form.comments.trim(),
        submittedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setFormOpen(false)
  }

  return (
    <RecruitmentPageShell
      activeSection="Interview Feedback"
      trailing={
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Submit Feedback
          </Button>
        </Feature>
      }
    >
      <Select value={candidateFilter} onValueChange={setCandidateFilter}>
        <SelectTrigger className="max-w-xs">
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

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Technical</TableHead>
              <TableHead>Communication</TableHead>
              <TableHead>Problem-solving</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-navy">
                  {row.candidateName}
                </TableCell>
                <TableCell>{row.jobTitle}</TableCell>
                <TableCell>{row.interviewer}</TableCell>
                <TableCell className="tabular-nums">{row.technicalRating}/5</TableCell>
                <TableCell className="tabular-nums">
                  {row.communicationRating}/5
                </TableCell>
                <TableCell className="tabular-nums">
                  {row.problemSolvingRating}/5
                </TableCell>
                <TableCell className="tabular-nums">{row.overallRating}/5</TableCell>
                <TableCell>
                  <RecommendationBadge value={row.recommendation} />
                </TableCell>
                <TableCell>{row.submittedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...historyByCandidate.entries()].map(([candidateId, items]) => {
          const name = items[0]?.candidateName ?? candidateId
          return (
            <div
              key={candidateId}
              className="rounded-2xl border border-border-soft bg-white p-4 shadow-sm"
            >
              <h2 className="font-semibold text-navy">{name}</h2>
              <p className="text-xs text-text-secondary">
                Feedback history ({items.length})
              </p>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border-soft px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{item.interviewer}</span>
                      <RecommendationBadge value={item.recommendation} />
                    </div>
                    <p className="mt-1 text-text-secondary">{item.comments}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Overall {item.overallRating}/5 · {item.submittedAt}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Interview Feedback</DialogTitle>
            <DialogDescription>
              Ratings are stored in local mock state only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Interview</Label>
              <Select
                value={form.interviewId}
                onValueChange={(v) => {
                  const interview = interviews.find((i) => i.id === v)
                  setForm((f) => ({
                    ...f,
                    interviewId: v,
                    interviewer: interview?.interviewers[0] ?? f.interviewer,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interview" />
                </SelectTrigger>
                <SelectContent>
                  {interviews.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.candidateName} · {i.round} ({i.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interviewer</Label>
              <Input
                value={form.interviewer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, interviewer: e.target.value }))
                }
              />
            </div>
            {(
              [
                ['technicalRating', 'Technical skills rating'],
                ['communicationRating', 'Communication rating'],
                ['problemSolvingRating', 'Problem-solving rating'],
                ['overallRating', 'Overall / interviewer rating'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label} (1–5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Overall recommendation</Label>
              <Select
                value={form.recommendation}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    recommendation: v as HireRecommendation,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recommendations.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Feedback comments</Label>
              <Textarea
                rows={4}
                value={form.comments}
                onChange={(e) =>
                  setForm((f) => ({ ...f, comments: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveFeedback}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}
