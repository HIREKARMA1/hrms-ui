import { CheckCircle2, ChevronRight, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

import { leadsOverviewStageChipBg } from '../../constants/leadsOverviewStatusColors'
import type { Lead, LeadPriority } from '../../types/lead'
import { OVERVIEW_FOCUS, OVERVIEW_MOTION } from './leadsOverviewUi'

type LeadsNeedsAttentionListProps = {
  leads: Lead[]
  fallbackLeads: Lead[]
  onOpenLead: (id: string) => void
  onViewAll?: () => void
  onCreate?: () => void
}

const PRIORITY_CHIP: Record<LeadPriority, string> = {
  High: 'bg-[#FEE2E2] text-[#B91C1C]',
  Medium: 'bg-[#FEF3C7] text-[#92400E]',
  Low: 'bg-[#EEF0F6] text-[#667085]',
}

export function LeadsNeedsAttentionList({
  leads,
  fallbackLeads,
  onOpenLead,
  onViewAll,
  onCreate,
}: LeadsNeedsAttentionListProps) {
  const showFallback = leads.length === 0
  const list = showFallback ? fallbackLeads.slice(0, 3) : leads.slice(0, 4)

  return (
    <div className="flex h-full min-h-[200px] flex-col p-3">
      {showFallback ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#E2E6EF] bg-[#F7F8FC] px-3 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-[#17213A]">All caught up</p>
            <p className="text-xs text-[#667085]">No urgent items. Recent leads below.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {onViewAll ? (
                <button type="button" onClick={onViewAll} className={cnOutlineBtn()}>
                  View all leads
                </button>
              ) : null}
              {onCreate ? (
                <button type="button" onClick={onCreate} className={cnPrimarySmall()}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Create lead
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <ul className={`space-y-2 ${showFallback ? 'mt-3' : ''}`}>
        {list.map((lead) => (
          <li
            key={lead.id}
            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${OVERVIEW_MOTION} hover:bg-[#F3F4F8]`}
          >
            <LeadRowSummary lead={lead} />
            <button type="button" onClick={() => onOpenLead(lead.id)} className={cnViewBtn()}>
              View
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LeadRowSummary({ lead }: { lead: Lead }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[14.5px] font-semibold text-[#17213A]">
        {lead.companyName.trim() || lead.leadName}
      </p>
      <p className="truncate text-[12.5px] text-[#667085]">
        {lead.id} · {lead.assignedEmployeeName ?? 'Unassigned'}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold text-[#17213A]"
          style={{ backgroundColor: leadsOverviewStageChipBg(lead.status) }}
        >
          {lead.status}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            PRIORITY_CHIP[lead.priority],
          )}
        >
          {lead.priority}
        </span>
      </div>
    </div>
  )
}

function cnViewBtn() {
  return cn(
    'inline-flex h-11 shrink-0 items-center gap-1 rounded-[10px] border border-[#E2E6EF] bg-white px-3 text-sm font-semibold text-[#0F766E]',
    OVERVIEW_MOTION,
    OVERVIEW_FOCUS,
    'hover:bg-[#F3F4F8]',
  )
}

function cnOutlineBtn() {
  return cn(
    'inline-flex h-9 items-center rounded-[10px] border border-[#E2E6EF] bg-white px-3 text-sm font-semibold text-[#17213A]',
    OVERVIEW_MOTION,
    OVERVIEW_FOCUS,
    'hover:bg-[#F3F4F8]',
  )
}

function cnPrimarySmall() {
  return cn(
    'inline-flex h-9 items-center gap-1 rounded-[10px] bg-[#0F766E] px-3 text-sm font-semibold text-white',
    OVERVIEW_MOTION,
    OVERVIEW_FOCUS,
    'hover:bg-[#7055EB]',
  )
}