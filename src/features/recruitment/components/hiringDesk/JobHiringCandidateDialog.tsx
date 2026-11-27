import { CalendarPlus, Pencil } from 'lucide-react'

import { Feature } from '@/features/rbac/components/Feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { Candidate, Interview } from '../../types/recruitment'
import type { SuggestedRound } from '../../utils/expectedRounds'
import { InterviewStatusBadge, StageBadge } from '../index'
import { RECRUITMENT_CARD } from '../shared/recruitmentUi'

type JobHiringCandidateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  jobTitle: string
  rounds: Interview[]
  suggestedRounds: SuggestedRound[]
  onSchedule: () => void
  onEdit: (interview: Interview) => void
}

export function JobHiringCandidateDialog({
  open,
  onOpenChange,
  candidate,
  jobTitle,
  rounds,
  suggestedRounds,
  onSchedule,
  onEdit,
}: JobHiringCandidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-4 overflow-y-auto">
        <div className="space-y-3 border-b border-[#E2E6EF] pb-4">
          <DialogHeader className="space-y-1.5 pr-8 text-left">
            <DialogTitle className="text-xl text-[#17213A]">
              {candidate?.fullName ?? 'Candidate'}
            </DialogTitle>
            <DialogDescription className="text-[#667085]">
              {jobTitle} — schedule or edit interview rounds for this applicant.
            </DialogDescription>
          </DialogHeader>
          {candidate ? (
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={candidate.stage} />
              <span className="text-sm text-[#667085]">{candidate.email}</span>
            </div>
          ) : null}
        </div>

        {suggestedRounds.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
              Suggested path
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedRounds.map((step, index) => {
                const covered = rounds.some(
                  (r) => r.interviewType === step.interviewType,
                )
                return (
                  <span key={step.label} className="inline-flex items-center gap-1">
                    {index > 0 ? (
                      <span className="text-[#667085]" aria-hidden>
                        →
                      </span>
                    ) : null}
                    <Badge
                      variant={covered ? 'default' : 'secondary'}
                      className={covered ? 'bg-[#0F766E]' : undefined}
                    >
                      {step.label}
                    </Badge>
                  </span>
                )
              })}
            </div>
          </div>
        ) : null}

        <Feature name="recruitment.manage">
          <Button type="button" className="w-fit gap-2" onClick={onSchedule}>
            <CalendarPlus className="h-4 w-4" />
            Add round
          </Button>
        </Feature>

        <ul className="space-y-3">
          {rounds.length === 0 ? (
            <li
              className={`${RECRUITMENT_CARD} px-4 py-8 text-center text-sm text-[#667085]`}
            >
              No interviews scheduled yet. Use <strong>Add round</strong> to
              book the first session.
            </li>
          ) : (
            rounds.map((row) => (
              <li
                key={row.id}
                className={`${RECRUITMENT_CARD} flex flex-col gap-2 p-4`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#17213A]">{row.round}</p>
                    <p className="text-xs text-[#667085]">{row.interviewType}</p>
                  </div>
                  <InterviewStatusBadge status={row.status} />
                </div>
                <p className="text-sm text-[#667085]">
                  {row.date} · {row.startTime}–{row.endTime}
                </p>
                <p className="text-xs text-[#667085]">
                  {row.interviewers.join(', ') || 'No interviewers'}
                  {row.location ? ` · ${row.location}` : ''}
                </p>
                <Feature name="recruitment.manage">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit gap-1"
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit round
                  </Button>
                </Feature>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}