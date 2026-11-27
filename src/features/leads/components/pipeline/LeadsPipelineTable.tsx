import { cn } from '@/lib/utils'

import type { Lead, LeadStatus } from '../../types/lead'
import { formatLeadAge } from '../../utils/formatLeadAge'
import { leadCompanyLabel } from '../../utils/leadDisplay'
import { LeadPriorityPill } from '../LeadPriorityPill'
import { LeadStatusPill } from '../LeadStatusPill'
import {
  LEADS_TABLE_ROW,
  LEADS_TABLE_ROW_ODD,
  LEADS_TABLE_SHELL,
  LEADS_TABLE_THEAD,
} from '../shared/leadsUi'
import { LeadsPipelineRowActions } from './LeadsPipelineRowActions'

type LeadsPipelineTableProps = {
  leads: Lead[]
  emptyMessage: string
  onOpenLead: (id: string) => void
  onOpenEdit?: (lead: Lead) => void
  canMove: boolean
  canEdit: boolean
  canDelete: boolean
  onMove: (lead: Lead, status: LeadStatus) => void
  onDelete: (lead: Lead) => void
}

const showActionsColumn = (canMove: boolean, canEdit: boolean, canDelete: boolean) =>
  canMove || canEdit || canDelete

export function LeadsPipelineTable({
  leads,
  emptyMessage,
  onOpenLead,
  onOpenEdit,
  canMove,
  canEdit,
  canDelete,
  onMove,
  onDelete,
}: LeadsPipelineTableProps) {
  const showActions = showActionsColumn(canMove, canEdit, canDelete)

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-hrms-border bg-hrms-page px-4 py-8 text-center text-sm text-hrms-text-muted">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className={LEADS_TABLE_SHELL}>
      <table className="w-full min-w-[1020px] text-left text-sm">
        <thead className={LEADS_TABLE_THEAD}>
          <tr>
            <th className="px-4 py-3 font-medium">Lead ID</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Owner</th>
            <th className="px-4 py-3 font-medium">Assigned by</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            {showActions ? <th className="px-4 py-3 text-right font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr
              key={lead.id}
              className={cn(LEADS_TABLE_ROW, index % 2 === 1 && LEADS_TABLE_ROW_ODD)}
              onClick={() => onOpenLead(lead.id)}
            >
              <td className="px-4 py-3 font-mono text-xs text-hrms-text-secondary">{lead.id}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-hrms-navy">{leadCompanyLabel(lead)}</p>
              </td>
              <td className="px-4 py-3 text-hrms-text-secondary">
                <p>{lead.email}</p>
                <p className="text-xs">{lead.phone}</p>
              </td>
              <td className="px-4 py-3">
                <LeadStatusPill status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <LeadPriorityPill priority={lead.priority} />
              </td>
              <td className="px-4 py-3 text-hrms-text-secondary">
                {lead.assignedEmployeeName ?? 'Unassigned'}
              </td>
              <td className="px-4 py-3 text-hrms-text-secondary">
                {lead.assignedByEmployeeName ?? lead.createdByEmployeeName ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-hrms-text-secondary">
                {formatLeadAge(lead.updatedAt)}
              </td>
              {showActions ? (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <LeadsPipelineRowActions
                    leadLabel={leadCompanyLabel(lead)}
                    currentStatus={lead.status}
                    canMove={canMove}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onMove={(status) => onMove(lead, status)}
                    onEdit={() => onOpenEdit?.(lead)}
                    onDelete={() => onDelete(lead)}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}