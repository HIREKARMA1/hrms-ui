import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { ApplicationStatus } from '../api/applicationsApi.types'
import type { InterviewRecommendation } from '../api/interviewsApi.types'
import type { OfferStatus as ApiOfferStatus } from '../api/offersApi.types'
import type {
  HireRecommendation,
  InterviewStatus,
  JobStatus,
  OfferStatus,
  ResumeParseStatus,
} from '../types/recruitment'
import { formatApplicationStatus, formatOfferStatus } from '../utils/applicationFormat'
import { PIPELINE_STAGE_STYLES } from '../utils/pipelineStageStyle'

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

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus | string }) {
  const key = status as ApplicationStatus
  const style = PIPELINE_STAGE_STYLES[key]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        style?.badge ?? 'border-slate-200 bg-slate-50 text-slate-700',
      )}
    >
      {formatApplicationStatus(status)}
    </span>
  )
}

/** @deprecated Use ApplicationStatusBadge — kept for legacy mock pages. */
export function StageBadge({ stage }: { stage: string }) {
  return <ApplicationStatusBadge status={stage} />
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

export function ApiOfferStatusBadge({ status }: { status: ApiOfferStatus }) {
  const variant =
    status === 'ACCEPTED' || status === 'RELEASED'
      ? 'success'
      : status === 'REJECTED' || status === 'WITHDRAWN'
        ? 'danger'
        : 'outline'
  return <Badge variant={variant}>{formatOfferStatus(status)}</Badge>
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

export function InterviewRecommendationBadge({
  value,
}: {
  value: InterviewRecommendation
}) {
  const variant =
    value === 'PASS' ? 'success' : value === 'HOLD' ? 'warning' : 'danger'
  return <Badge variant={variant}>{value}</Badge>
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
