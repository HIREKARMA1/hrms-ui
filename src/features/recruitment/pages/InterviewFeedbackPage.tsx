import { Plus, RefreshCw } from 'lucide-react'
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

import {
  INTERVIEWS_PAGE_SIZE,
  useListInterviewsQuery,
  useSubmitInterviewFeedbackMutation,
} from '../api/interviewsApi'
import type { InterviewRecommendation } from '../api/interviewsApi.types'
import { RecruitmentPageShell } from '../components'
import { getInterviewErrorMessage } from '../api/interviewsApi'

const RECOMMENDATIONS: InterviewRecommendation[] = ['PASS', 'FAIL', 'HOLD']

type FeedbackForm = {
  interviewId: string
  recommendation: InterviewRecommendation
  comments: string
}

const emptyForm: FeedbackForm = {
  interviewId: '',
  recommendation: 'HOLD',
  comments: '',
}

export function InterviewFeedbackPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FeedbackForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const interviewsQuery = useListInterviewsQuery({ page: 1, limit: INTERVIEWS_PAGE_SIZE })
  const [submitFeedback] = useSubmitInterviewFeedbackMutation()

  const rows = useMemo(() => interviewsQuery.data?.items ?? [], [interviewsQuery.data])

  const openCreate = () => {
    setForm({
      ...emptyForm,
      interviewId: rows[0]?.id ?? '',
    })
    setFormError(null)
    setFormOpen(true)
  }

  const saveFeedback = async () => {
    if (!form.interviewId) {
      setFormError('Select an interview.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await submitFeedback({
        id: form.interviewId,
        body: {
          recommendation: form.recommendation,
          ...(form.comments.trim() ? { comments: form.comments.trim() } : {}),
        },
      }).unwrap()
      setFormOpen(false)
      void interviewsQuery.refetch()
    } catch (error) {
      setFormError(getInterviewErrorMessage(error, 'Could not submit feedback.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <RecruitmentPageShell
      activeSection="Interview Feedback"
      trailing={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void interviewsQuery.refetch()}
            disabled={interviewsQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${interviewsQuery.isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Feature name="recruitment.manage">
            <Button type="button" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Submit Feedback
            </Button>
          </Feature>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {interviewsQuery.isLoading ? (
          <Skeleton className="m-4 h-32 w-full" />
        ) : interviewsQuery.isError ? (
          <div className="space-y-3 p-6">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(interviewsQuery.error, 'Could not load interviews.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void interviewsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No interviews to show.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-navy">
                    {row.candidateName ?? row.candidateId}
                  </TableCell>
                  <TableCell>{row.jobTitle ?? '—'}</TableCell>
                  <TableCell>{row.round ?? '—'}</TableCell>
                  <TableCell>{row.scheduledAt ?? '—'}</TableCell>
                  <TableCell>{row.status ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview feedback</DialogTitle>
            <DialogDescription>POST `/recruitment/interviews/:id/feedback`</DialogDescription>
          </DialogHeader>
          {formError ? (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Interview</Label>
              <Select
                value={form.interviewId}
                onValueChange={(v) => setForm((f) => ({ ...f, interviewId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interview" />
                </SelectTrigger>
                <SelectContent>
                  {rows.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.candidateName ?? row.id} · {row.round ?? 'Round'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select
                value={form.recommendation}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, recommendation: v as InterviewRecommendation }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDATIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Feature name="recruitment.manage">
              <Button type="button" onClick={() => void saveFeedback()} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit'}
              </Button>
            </Feature>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}