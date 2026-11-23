import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import type { Lead, LeadStatus } from '../../types/lead'
import { CLOSED_PIPELINE_STATUSES } from './pipelineStages'
import { LeadsPipelineTable } from './LeadsPipelineTable'
import { sortPipelineLeads } from './sortPipelineLeads'

type LeadsPipelineClosedSectionProps = {
  leadsByStatus: Map<LeadStatus, Lead[]>
  wonCount: number
  lostCount: number
  onOpenLead: (id: string) => void
  onOpenEdit?: (lead: Lead) => void
  canMove: boolean
  canEdit: boolean
  canDelete: boolean
  onMoveLead: (lead: Lead, status: LeadStatus) => void
  onDeleteLead: (lead: Lead) => void
}

export function LeadsPipelineClosedSection({
  leadsByStatus,
  wonCount,
  lostCount,
  onOpenLead,
  onOpenEdit,
  canMove,
  canEdit,
  canDelete,
  onMoveLead,
  onDeleteLead,
}: LeadsPipelineClosedSectionProps) {
  const total = wonCount + lostCount
  const [open, setOpen] = useState(false)

  const closedLeads = useMemo(() => {
    const rows = CLOSED_PIPELINE_STATUSES.flatMap((status) => leadsByStatus.get(status) ?? [])
    return sortPipelineLeads(rows)
  }, [leadsByStatus])

  return (
    <section aria-label="Closed deals" className="border-t border-hrms-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left hover:bg-hrms-row-hover"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-hrms-text-muted transition-transform', open && 'rotate-180')}
          aria-hidden
        />
        <span className="text-sm font-semibold uppercase tracking-wide text-hrms-text-secondary">Closed</span>
        <span className="text-xs text-hrms-text-muted">
          {total === 0 ? 'No won or lost leads' : `${wonCount} won · ${lostCount} lost`}
        </span>
      </button>
      {open ? (
        <div className="mt-2">
          <LeadsPipelineTable
            leads={closedLeads}
            emptyMessage="No closed leads in this view."
            onOpenLead={onOpenLead}
            onOpenEdit={onOpenEdit}
            canMove={canMove}
            canEdit={canEdit}
            canDelete={canDelete}
            onMove={onMoveLead}
            onDelete={onDeleteLead}
          />
        </div>
      ) : null}
    </section>
  )
}