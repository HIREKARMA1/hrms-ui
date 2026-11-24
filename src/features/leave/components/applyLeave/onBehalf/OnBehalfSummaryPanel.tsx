import { AlertTriangle, CircleAlert } from 'lucide-react'

import type { ResolvedApprovalStep } from '../../../utils/getApprovalChain'
import type { LeaveValidationResult } from '../../../utils/validateLeaveRequest'
import { OnBehalfApprovalTimeline } from './OnBehalfApprovalTimeline'
import { obSectionTitleClass } from './onBehalfDialogUi'

type OnBehalfSummaryPanelProps = {
  preview: LeaveValidationResult | null
  chain: ResolvedApprovalStep[]
  balanceBefore: number | null
  balanceAfter: number | null
  applicantName: string
  hasDates: boolean
  submitterName?: string
}

function StatCard({
  label,
  value,
  unit,
  empty,
}: {
  label: string
  value: string
  unit?: string
  empty?: boolean
}) {
  return (
    <div className="rounded-xl border border-[#E2E6EF] bg-white p-3.5">
      <p className="text-[12.5px] text-[#667085]">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span
          className={`text-2xl font-bold tabular-nums ${empty ? 'text-[#CBD5E1]' : 'text-[#17213A]'}`}
        >
          {value}
        </span>
        {unit && !empty ? <span className="text-[13px] text-[#667085]">{unit}</span> : null}
      </p>
    </div>
  )
}

export function OnBehalfSummaryPanel({
  preview,
  chain,
  balanceBefore,
  balanceAfter,
  applicantName,
  hasDates,
  submitterName,
}: OnBehalfSummaryPanelProps) {
  const ready = hasDates && preview != null
  const known = ready && balanceBefore !== null && balanceAfter !== null

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto border-[#E2E6EF] bg-[#F7F8FC] p-6 max-[820px]:border-t max-[820px]:border-l-0 min-[820px]:border-l max-[480px]:p-4">
      <h3 className={obSectionTitleClass}>Preview</h3>
      <p className="mt-1 text-[12.5px] text-[#667085]">
        {ready ? 'Review days and balance before submitting.' : 'Select leave type and dates to see impact.'}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          label="Days counted"
          value={ready ? String(preview.daysCounted) : '—'}
          unit={ready ? 'days' : undefined}
          empty={!ready}
        />
        <StatCard
          label="Balance after"
          value={known ? String(balanceAfter) : '—'}
          unit={known ? 'days' : undefined}
          empty={!known}
        />
      </div>

      <div className="mt-6">
        <h3 className={obSectionTitleClass}>Approval flow</h3>
        <div className="mt-3">
          <OnBehalfApprovalTimeline
            applicantName={applicantName}
            submitterName={submitterName}
            chain={chain}
          />
        </div>
      </div>

      {preview?.errors.length ? (
        <ul className="mt-4 space-y-2">
          {preview.errors.map((err) => (
            <li key={err} className="flex gap-2 rounded-lg border border-[#FDEAEA] bg-[#FDEAEA] p-2 text-xs text-[#17213A]">
              <CircleAlert className="h-4 w-4 shrink-0 text-[#EF4444]" aria-hidden />
              {err}
            </li>
          ))}
        </ul>
      ) : null}
      {preview?.warnings.length ? (
        <ul className="mt-4 space-y-2">
          {preview.warnings.map((warn) => (
            <li key={warn} className="flex gap-2 rounded-lg border border-[#FEF3DC] bg-[#FEF3DC] p-2 text-xs text-[#17213A]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#B45309]" aria-hidden />
              {warn}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  )
}