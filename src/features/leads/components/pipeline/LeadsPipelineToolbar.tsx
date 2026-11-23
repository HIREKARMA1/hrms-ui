import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

import { LEAD_PRIORITIES } from '../../constants/leadOptions'
import { LEADS_PIPELINE_TOOLBAR } from '../shared/leadsUi'
import { ACTIVE_PIPELINE_STATUSES } from './pipelineStages'

const selectClass =
  'h-9 rounded-lg border border-hrms-border bg-white px-2.5 text-sm text-hrms-navy'

export type PipelineStatusFilter = 'All active' | (typeof ACTIVE_PIPELINE_STATUSES)[number]

type LeadsPipelineToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  statusFilter: PipelineStatusFilter
  onStatusFilterChange: (value: PipelineStatusFilter) => void
  activeCount: number
  wonCount: number
  lostCount: number
}

export function LeadsPipelineToolbar({
  search,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusFilterChange,
  activeCount,
  wonCount,
  lostCount,
}: LeadsPipelineToolbarProps) {
  return (
    <div className={`${LEADS_PIPELINE_TOOLBAR} space-y-2`}>
      <p className="text-sm text-hrms-text-muted lg:hidden">
        Tap a row for details · use <span className="text-hrms-navy">move</span> in Actions to change stage
      </p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-hrms-text-muted" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search company, lead name, ID…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PipelineStatusFilter)}
            aria-label="Filter by stage"
          >
            <option value="All active">All active stages</option>
            {ACTIVE_PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All priorities</option>
            {LEAD_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="hidden h-4 w-px bg-hrms-border lg:inline" aria-hidden />
          <span className="rounded-full border border-hrms-border bg-hrms-page px-2.5 py-1 text-xs text-hrms-navy">
            <span className="font-semibold tabular-nums text-hrms-primary">{activeCount}</span> active
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
            <span className="font-semibold tabular-nums">{wonCount}</span> won
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            <span className="font-semibold tabular-nums">{lostCount}</span> lost
          </span>
        </div>
      </div>
    </div>
  )
}