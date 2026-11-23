/**
 * Severity banner at the top of the Overview attention section.
 */

import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { AttentionSummary } from '../../utils/buildAttentionSummary'
import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'
import { overviewGreeting } from '../../utils/overviewGreeting'

const SHELL: Record<AttentionSummary['severity'], string> = {
  danger: 'border-hrms-danger/30 bg-hrms-danger/5',
  warning: 'border-hrms-warning/30 bg-hrms-warning/5',
  success: 'border-hrms-success/30 bg-hrms-success/5',
}

const ACCENT: Record<AttentionSummary['severity'], string> = {
  danger: 'bg-hrms-danger',
  warning: 'bg-hrms-warning',
  success: 'bg-hrms-success',
}

const ICON: Record<AttentionSummary['severity'], typeof AlertTriangle> = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
}

type Props = {
  summary: AttentionSummary
  displayName: string
  onNavigate: HrOverviewNavigate
}

export function OverviewAttentionBanner({ summary, displayName, onNavigate }: Props) {
  const Icon = ICON[summary.severity]
  return (
    <div role="status" className={cn('relative overflow-hidden rounded-xl border p-5 pl-6', SHELL[summary.severity])}>
      <span className={cn('absolute bottom-0 left-0 top-0 w-1', ACCENT[summary.severity])} aria-hidden />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80', summary.severity === 'success' ? 'text-hrms-success' : summary.severity === 'danger' ? 'text-hrms-danger' : 'text-hrms-warning')}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs text-hrms-text-secondary">{overviewGreeting(displayName)}</p>
            <h2 className="mt-0.5 text-base font-semibold text-hrms-navy">{summary.headline}</h2>
            <p className="mt-1 text-sm text-hrms-text-secondary">{summary.summarySentence}</p>
          </div>
        </div>
        {summary.waitingCount > 0 ? (
          <Button type="button" size="sm" className="shrink-0" onClick={() => onNavigate('Requests', { segment: 'action' })}>
            Review requests
          </Button>
        ) : null}
      </div>
    </div>
  )
}
