/**
 * HR Overview attention: status banner and non-request alert list only.
 */

import { useMemo } from 'react'

import { Button } from '@/components/ui/button'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'
import { buildAttentionSummary, type AttentionSummary } from '../../utils/buildAttentionSummary'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { OverviewAttentionBanner } from './OverviewAttentionBanner'
import { OverviewAttentionAlso } from './OverviewAttentionAlso'

type Props = {
  snapshot: LeaveSnapshot | null
  onNavigate: HrOverviewNavigate
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  attentionSummary?: AttentionSummary | null
  attentionLoading?: boolean
  attentionError?: string | null
  onRetryAttention?: () => void
}

export function OverviewAttentionSection({
  snapshot,
  onNavigate,
  loading,
  error,
  onRetry,
  attentionSummary,
  attentionLoading,
  attentionError,
  onRetryAttention,
}: Props) {
  const { viewer } = useLeaveViewer()
  const fallbackSummary = useMemo(() => (snapshot ? buildAttentionSummary(snapshot) : null), [snapshot])
  const summary = attentionSummary ?? fallbackSummary
  const panelLoading = attentionLoading ?? loading
  const panelError = attentionError ?? error
  const panelRetry = onRetryAttention ?? onRetry
  if (panelLoading) {
    return (
      <div className="animate-pulse space-y-4 motion-reduce:animate-none" aria-hidden>
        <div className="h-24 rounded-xl bg-hrms-muted-bg" />
        <div className="h-40 rounded-xl bg-hrms-muted-bg" />
      </div>
    )
  }
  if (panelError) return <AttentionError message={panelError} onRetry={panelRetry} />
  if (!snapshot || !summary) return null
  return (
    <section className="flex flex-col gap-4" aria-labelledby="overview-attention-heading">
      <span id="overview-attention-heading" className="sr-only">
        Needs your attention
      </span>
      <OverviewAttentionBanner summary={summary} displayName={viewer.displayName} onNavigate={onNavigate} />
      {summary.severity !== 'success' && summary.otherItems.length > 0 ? (
        <OverviewAttentionAlso summary={summary} onNavigate={onNavigate} />
      ) : null}
    </section>
  )
}

function AttentionError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-hrms-border bg-white p-5 text-sm text-hrms-danger">
      {message}
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

