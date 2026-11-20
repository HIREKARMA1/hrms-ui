/**
 * Right-column summary for Apply leave dialog (days, balance, approval stepper).
 */

import { AlertTriangle, CircleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ResolvedApprovalStep } from '../../utils/getApprovalChain'
import type { LeaveValidationResult } from '../../utils/validateLeaveRequest'
import { ApplyLeaveApprovalSteps } from './ApplyLeaveApprovalSteps'
import { ApplyLeaveSectionTitle } from './ApplyLeaveSectionTitle'

type ApplyLeaveSummaryPanelProps = {
  preview: LeaveValidationResult | null
  chain: ResolvedApprovalStep[]
  /** Null when the balance is not known (e.g. still loading from the server). */
  balanceBefore: number | null
  balanceAfter: number | null
  applicantName: string
  hasDates: boolean
  onBehalf?: boolean
  submitterName?: string
}

export function ApplyLeaveSummaryPanel({
  preview,
  chain,
  balanceBefore,
  balanceAfter,
  applicantName,
  hasDates,
  onBehalf,
  submitterName,
}: ApplyLeaveSummaryPanelProps) {
  const ready = hasDates && preview != null
  const known = ready && balanceBefore !== null && balanceAfter !== null
  const low = known && balanceAfter < 2
  const negative = known && balanceAfter < 0
  const showBar = known && preview.daysCounted > 0 && balanceBefore > 0
  const pct = showBar ? Math.max(0, Math.min(100, (balanceAfter / balanceBefore) * 100)) : 0

  return (
    <aside className="flex h-full flex-col rounded-xl bg-hrms-lavender/40 p-4">
      <ApplyLeaveSectionTitle>Preview</ApplyLeaveSectionTitle>
      <p className="mt-2 text-xs text-hrms-text-secondary">
        {ready ? 'Review days and balance before submitting.' : 'Select leave type and dates to see impact.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Days counted" value={ready ? String(preview.daysCounted) : '—'} large />
        <StatTile
          label="Balance after"
          value={known ? String(balanceAfter) : '—'}
          tone={known ? (negative ? 'danger' : low ? 'warning' : 'default') : 'muted'}
        />
      </div>

      {known ? (
        <p className="mt-2 text-xs tabular-nums text-hrms-text-secondary">
          From <span className="font-medium text-hrms-navy">{balanceBefore}</span> days available
        </p>
      ) : null}

      {showBar ? (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div
            className={cn('h-full rounded-full bg-hrms-primary', negative && 'bg-hrms-danger')}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="mt-2 h-2 rounded-full bg-white/80" aria-hidden />
      )}

      <div className="mt-6 flex-1">
        <ApplyLeaveSectionTitle>Approval flow</ApplyLeaveSectionTitle>
        <div className="mt-3">
          <ApplyLeaveApprovalSteps
            onBehalf={onBehalf}
            applicantName={applicantName}
            submitterName={submitterName}
            chain={chain}
          />
        </div>
      </div>

      {preview?.errors.length ? (
        <ul className="mt-4 space-y-2">
          {preview.errors.map((err) => (
            <li key={err} className="flex gap-2 rounded-lg bg-hrms-danger/10 p-2 text-xs text-hrms-navy">
              <CircleAlert className="h-4 w-4 shrink-0 text-hrms-danger" aria-hidden />
              {err}
            </li>
          ))}
        </ul>
      ) : null}
      {preview?.warnings.length ? (
        <ul className="mt-4 space-y-2">
          {preview.warnings.map((warn) => (
            <li key={warn} className="flex gap-2 rounded-lg bg-hrms-warning/10 p-2 text-xs text-hrms-navy">
              <AlertTriangle className="h-4 w-4 shrink-0 text-hrms-warning" aria-hidden />
              {warn}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}

function StatTile({
  label,
  value,
  large,
  tone = 'default',
}: {
  label: string
  value: string
  large?: boolean
  tone?: 'default' | 'muted' | 'warning' | 'danger'
}) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/70 px-3 py-2">
      <p className="text-[11px] font-medium text-hrms-text-secondary">{label}</p>
      <p
        className={cn(
          'mt-0.5 tabular-nums font-semibold text-hrms-navy',
          large ? 'text-2xl' : 'text-lg',
          tone === 'danger' && 'text-hrms-danger',
          tone === 'warning' && 'text-hrms-warning',
          tone === 'muted' && 'text-hrms-text-muted',
        )}
      >
        {value}
      </p>
    </div>
  )
}
