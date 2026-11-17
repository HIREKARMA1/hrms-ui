import { useCallback, useMemo, useState } from 'react'

import type { UserRole } from '@/features/leave/constants/userRoles'
import { isEmployeeExperience, isManagerExperience } from '@/features/leave/constants/userRoles'

import type { LeadsListScope } from '../../constants/leadsDemoActor'
import { useLeads } from '../../hooks/useLeads'
import { useLeadsScope } from '../../hooks/useLeadsScope'
import type { Lead, LeadStatus } from '../../types/lead'
import { leadToInput } from '../../utils/leadForm'
import { LeadsMockBanner } from '../LeadsMockBanner'
import { LeadsPipelineClosedSection } from './LeadsPipelineClosedSection'
import { LeadsPipelineTable } from './LeadsPipelineTable'
import { ACTIVE_PIPELINE_STATUSES } from './pipelineStages'
import { sortPipelineLeads } from './sortPipelineLeads'
import {
  LeadsPipelineToolbar,
  type PipelineStatusFilter,
} from './LeadsPipelineToolbar'

type LeadsPipelineTabProps = {
  role: UserRole
  onOpenEdit: (lead: Lead) => void
}

export function LeadsPipelineTab({ role, onOpenEdit }: LeadsPipelineTabProps) {
  const scope: LeadsListScope = isEmployeeExperience(role)
    ? 'my'
    : isManagerExperience(role)
      ? 'team'
      : 'org'
  const {
    scopedLeads,
    setSelectedLeadId,
    deleteLead,
    canEditLead,
    canDeleteLeads,
  } = useLeadsScope(role, scope)
  const { updateLead } = useLeads()

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<PipelineStatusFilter>('All active')

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scopedLeads.filter((lead) => {
      if (priorityFilter !== 'All' && lead.priority !== priorityFilter) return false
      if (!q) return true
      return (
        lead.id.toLowerCase().includes(q) ||
        lead.leadName.toLowerCase().includes(q) ||
        lead.companyName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q)
      )
    })
  }, [scopedLeads, search, priorityFilter])

  const activeCount = useMemo(
    () => filteredLeads.filter((l) => ACTIVE_PIPELINE_STATUSES.includes(l.status)).length,
    [filteredLeads],
  )
  const wonCount = useMemo(() => filteredLeads.filter((l) => l.status === 'Won').length, [filteredLeads])
  const lostCount = useMemo(() => filteredLeads.filter((l) => l.status === 'Lost').length, [filteredLeads])

  const leadsByStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>()
    for (const lead of filteredLeads) {
      const list = map.get(lead.status) ?? []
      list.push(lead)
      map.set(lead.status, list)
    }
    return map
  }, [filteredLeads])

  const activePipelineLeads = useMemo(() => {
    let rows = filteredLeads.filter((lead) => ACTIVE_PIPELINE_STATUSES.includes(lead.status))
    if (statusFilter !== 'All active') {
      rows = rows.filter((lead) => lead.status === statusFilter)
    }
    return sortPipelineLeads(rows)
  }, [filteredLeads, statusFilter])

  const handleMove = useCallback(
    async (lead: Lead, status: LeadStatus) => {
      if (!canEditLead) return
      const input = leadToInput(lead)
      input.status = status
      await updateLead(lead.id, input)
    },
    [canEditLead, updateLead],
  )

  const handleDelete = useCallback(
    async (lead: Lead) => {
      if (!canDeleteLeads) return
      if (!window.confirm(`Delete lead ${lead.id}?`)) return
      await deleteLead(lead.id)
    },
    [canDeleteLeads, deleteLead],
  )

  const openLead = useCallback((id: string) => setSelectedLeadId(id), [setSelectedLeadId])

  return (
    <div className="space-y-4">
      <LeadsMockBanner />
      <LeadsPipelineToolbar
        search={search}
        onSearchChange={setSearch}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeCount={activeCount}
        wonCount={wonCount}
        lostCount={lostCount}
      />

      <section aria-label="Active pipeline">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hrms-text-secondary">
              Active pipeline
            </h2>
            <span className="hidden text-xs text-hrms-text-muted sm:inline">New → Negotiation</span>
          </div>
          <span className="hidden text-xs text-hrms-text-muted lg:inline">
            Row opens lead · Actions: move stage, edit, delete
          </span>
        </div>
        <LeadsPipelineTable
          leads={activePipelineLeads}
          emptyMessage="No active leads match your filters. Try another stage or clear search."
          onOpenLead={openLead}
          onOpenEdit={onOpenEdit}
          canMove={canEditLead}
          canEdit={canEditLead}
          canDelete={canDeleteLeads}
          onMove={handleMove}
          onDelete={handleDelete}
        />
      </section>

      <LeadsPipelineClosedSection
        leadsByStatus={leadsByStatus}
        wonCount={wonCount}
        lostCount={lostCount}
        onOpenLead={openLead}
        onOpenEdit={onOpenEdit}
        canMove={canEditLead}
        canEdit={canEditLead}
        canDelete={canDeleteLeads}
        onMoveLead={handleMove}
        onDeleteLead={handleDelete}
      />
    </div>
  )
}