/**
 * HR Overview attention: status banner and non-request alert list only.
 */

import { useMemo } from 'react'

import { Button } from '@/components/ui/button'

import type { LeaveSnapshot } from '../../services/leaveService'
import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'
import { buildAttentionSummary } from '../../utils/buildAttentionSummary'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { OverviewAttentionBanner } from './OverviewAttentionBanner'
import { OverviewAttentionAlso } from './OverviewAttentionAlso'

type Props = {
  snapshot: LeaveSnapshot | null
  onNavigate: HrOverviewNavigate
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function OverviewAttentionSection({ snapshot, onNavigate, loading, error, onRetry }: Props) {
  const { viewer } = useLeaveViewer()
  const summary = useMemo(() => (snapshot ? buildAttentionSummary(snapshot) : null), [snapshot])
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 motion-reduce:animate-none" aria-hidden>
        <div className="h-24 rounded-xl bg-hrms-muted-bg" />
        <div className="h-40 rounded-xl bg-hrms-muted-bg" />
      </div>
    )
  }
  if (error) return <AttentionError message={error} onRetry={onRetry} />
  if (!snapshot || !summary) return null
  return (
    <section className="flex flex-col gap-4" aria-labelledby="overview-attention-heading">
      <span id="overview-attention-heading" className="sr-only">
        Needs your attention
      </span>
      <OverviewAttentionBanner summary={summary} displayName={viewer.displayName} onNavigate={onNavigate} />
      <OverviewAttentionAlso summary={summary} onNavigate={onNavigate} />
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
