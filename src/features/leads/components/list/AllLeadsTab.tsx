import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

import { LEAD_PRIORITIES, LEAD_STATUSES } from '../../constants/leadOptions'
import { useLeads } from '../../hooks/useLeads'
import type { Lead, LeadPriority, LeadStatus } from '../../types/lead'
import { LeadPriorityPill } from '../LeadPriorityPill'
import { AssignLeadDialog } from './AssignLeadDialog'
import { LeadsListRowActions } from './LeadsListRowActions'
import { LeadStatusPill } from '../LeadStatusPill'
import {
  LEADS_FILTER_BAR,
  LEADS_FILTER_INPUT,
  LEADS_FILTER_SELECT,
  LEADS_TABLE_ROW,
  LEADS_TABLE_ROW_ODD,
  LEADS_TABLE_SHELL,
  LEADS_TABLE_THEAD,
} from '../shared/leadsUi'

type AllLeadsTabProps = {
  onOpenCreate?: () => void
  onOpenEdit: (lead: Lead) => void
  canEditLead: boolean
  canDeleteLeads: boolean
  canAssignLeads?: boolean
}

export function AllLeadsTab({
  onOpenCreate,
  onOpenEdit,
  canEditLead,
  canDeleteLeads,
  canAssignLeads = false,
}: AllLeadsTabProps) {
  const {
    leads,
    setSelectedLeadId,
    deleteLead,
    listQuery,
    setListQuery,
    pagination,
    loading,
  } = useLeads()
  const showActions = canEditLead || canDeleteLeads || canAssignLeads
  const [search, setSearch] = useState(listQuery.search)
  const [assignLead, setAssignLead] = useState<Lead | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (search !== listQuery.search) {
        setListQuery({ search })
      }
    }, 300)
    return () => window.clearTimeout(handle)
  }, [search, listQuery.search, setListQuery])

  return (
    <div className="space-y-4">
      <div className={`${LEADS_FILTER_BAR} flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-hrms-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email…"
            className={LEADS_FILTER_INPUT}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={LEADS_FILTER_SELECT}
            value={listQuery.status}
            onChange={(e) =>
              setListQuery({
                status: e.target.value as LeadStatus | 'All',
              })
            }
          >
            <option value="All">All statuses</option>
            {LEAD_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className={LEADS_FILTER_SELECT}
            value={listQuery.priority}
            onChange={(e) =>
              setListQuery({
                priority: e.target.value as LeadPriority | 'All',
              })
            }
          >
            <option value="All">All priorities</option>
            {LEAD_PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {onOpenCreate ? (
            <Button type="button" className="gap-2" onClick={onOpenCreate}>
              <Plus className="h-4 w-4" />
              Create lead
            </Button>
          ) : null}
        </div>
      </div>
      <div className={LEADS_TABLE_SHELL}>
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className={LEADS_TABLE_THEAD}>
            <tr>
              <th className="px-4 py-3 font-medium">Lead ID</th>
              <th className="px-4 py-3 font-medium">Lead / company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Assigned by</th>
              {showActions ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className={cn(LEADS_TABLE_ROW, index % 2 === 1 && LEADS_TABLE_ROW_ODD)}
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <td className="px-4 py-3 font-mono text-xs text-hrms-text-secondary">
                  {lead.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-hrms-navy">{lead.leadName}</p>
                  <p className="text-xs text-hrms-text-muted">{lead.companyName || '—'}</p>
                </td>
                <td className="px-4 py-3 text-hrms-text-secondary">
                  <p>{lead.email}</p>
                  <p className="text-xs">{lead.phone}</p>
                </td>
                <td className="px-4 py-3 text-hrms-text-secondary">{lead.source}</td>
                <td className="px-4 py-3">
                  <LeadPriorityPill priority={lead.priority} />
                </td>
                <td className="px-4 py-3">
                  <LeadStatusPill status={lead.status} />
                </td>
                <td className="px-4 py-3 text-hrms-text-secondary">
                  {lead.assignedEmployeeName ?? '—'}
                </td>
                <td className="px-4 py-3 text-hrms-text-secondary">
                  {lead.assignedByEmployeeName ?? lead.createdByEmployeeName ?? '—'}
                </td>
                {showActions ? (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <LeadsListRowActions
                      leadLabel={lead.leadName}
                      onAssign={() => setAssignLead(lead)}
                      onEdit={() => onOpenEdit(lead)}
                      onDelete={() => {
                        if (!canDeleteLeads) return
                        if (!window.confirm(`Delete lead ${lead.leadName}?`)) return
                        void deleteLead(lead.id)
                      }}
                      showAssign={canAssignLeads}
                      showEdit={canEditLead}
                      showDelete={canDeleteLeads}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && leads.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-hrms-text-muted">No leads match filters.</p>
        ) : null}
      </div>
      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2 text-sm text-hrms-text-secondary">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setListQuery({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setListQuery({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
      {canAssignLeads ? (
        <AssignLeadDialog
          lead={assignLead}
          open={Boolean(assignLead)}
          onOpenChange={(open) => {
            if (!open) setAssignLead(null)
          }}
        />
      ) : null}
    </div>
  )
}
