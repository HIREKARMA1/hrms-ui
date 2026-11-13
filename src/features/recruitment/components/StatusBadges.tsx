import { Badge } from '@/components/ui/badge'

import type {
  HireRecommendation,
  InterviewStatus,
  JobStatus,
  OfferStatus,
  PipelineStage,
  ResumeParseStatus,
} from '../types/recruitment'

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const variant =
    status === 'Published'
      ? 'success'
      : status === 'Closed'
        ? 'secondary'
        : status === 'On Hold'
          ? 'warning'
          : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

export function StageBadge({ stage }: { stage: PipelineStage }) {
  const variant =
    stage === 'Rejected'
      ? 'danger'
      : stage === 'Joined' || stage === 'Offer Released'
        ? 'success'
        : stage === 'Interview' || stage === 'Selected'
          ? 'default'
          : 'secondary'
  return <Badge variant={variant}>{stage}</Badge>
}

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const variant =
    status === 'Completed'
      ? 'success'
      : status === 'Cancelled'
        ? 'danger'
        : status === 'Rescheduled'
          ? 'warning'
          : 'default'
  return <Badge variant={variant}>{status}</Badge>
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const variant =
    status === 'Accepted' || status === 'Released'
      ? 'success'
      : status === 'Rejected' || status === 'Expired'
        ? 'danger'
        : status === 'Pending Approval'
          ? 'warning'
          : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

export function RecommendationBadge({
  value,
}: {
  value: HireRecommendation
}) {
  const variant =
    value === 'Strong Hire' || value === 'Hire'
      ? 'success'
      : value === 'Hold'
        ? 'warning'
        : 'danger'
  return <Badge variant={variant}>{value}</Badge>
}

export function ResumeParseBadge({ status }: { status: ResumeParseStatus }) {
  const variant =
    status === 'Completed (Demo)'
      ? 'warning'
      : status === 'Unavailable'
        ? 'danger'
        : status === 'Pending'
          ? 'secondary'
          : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}
