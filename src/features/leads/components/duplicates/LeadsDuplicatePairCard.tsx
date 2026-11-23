import { ArrowLeftRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { LeadDuplicatePair } from '../../utils/leadDuplicatePairs'
import { LEADS_DUPLICATE_PAIR_HEADER, LEADS_MATCH_HIGHLIGHT } from '../shared/leadsUi'
import { LeadStatusPill } from '../LeadStatusPill'

type LeadsDuplicatePairCardProps = {
  pair: LeadDuplicatePair
  onOpenLead: (id: string) => void
}

export function LeadsDuplicatePairCard({ pair, onOpenLead }: LeadsDuplicatePairCardProps) {
  return (
    <li className="overflow-hidden rounded-lg border border-hrms-border bg-white shadow-sm">
      <div className={`${LEADS_DUPLICATE_PAIR_HEADER} flex flex-wrap items-center justify-between gap-2`}>
        <p className="text-sm font-medium text-hrms-navy">{pair.reasons.join(' · ')}</p>
        <span className="text-xs text-hrms-text-muted">
          {pair.leadA.id} ↔ {pair.leadB.id}
        </span>
      </div>
      <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr]">
        <DuplicateLeadSide
          label="Lead A"
          lead={pair.leadA}
          highlightEmail={pair.reasons.some((r) => r.includes('Email'))}
          highlightPhone={pair.reasons.some((r) => r.includes('Phone'))}
          onOpen={() => onOpenLead(pair.leadA.id)}
        />
        <div className="hidden items-center justify-center border-x border-hrms-border bg-hrms-muted-bg/40 px-2 md:flex">
          <ArrowLeftRight className="h-4 w-4 text-hrms-text-muted" aria-hidden />
        </div>
        <DuplicateLeadSide
          label="Lead B"
          lead={pair.leadB}
          highlightEmail={pair.reasons.some((r) => r.includes('Email'))}
          highlightPhone={pair.reasons.some((r) => r.includes('Phone'))}
          onOpen={() => onOpenLead(pair.leadB.id)}
        />
      </div>
    </li>
  )
}

function DuplicateLeadSide({
  label,
  lead,
  onOpen,
  highlightEmail,
  highlightPhone,
}: {
  label: string
  lead: LeadDuplicatePair['leadA']
  onOpen: () => void
  highlightEmail?: boolean
  highlightPhone?: boolean
}) {
  return (
    <div className="p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-hrms-navy">{lead.companyName}</p>
      <p className="mt-0.5 truncate text-sm text-hrms-text-muted">{lead.leadName}</p>
      <dl className="mt-2.5 space-y-1.5">
        <div className="flex gap-2 text-sm">
          <dt className="w-14 shrink-0 text-xs text-hrms-text-muted">Email</dt>
          <dd
            className={`min-w-0 truncate text-hrms-text-secondary ${highlightEmail ? LEADS_MATCH_HIGHLIGHT : ''}`}
          >
            {lead.email || '—'}
          </dd>
        </div>
        <div className="flex gap-2 text-sm">
          <dt className="w-14 shrink-0 text-xs text-hrms-text-muted">Phone</dt>
          <dd
            className={`min-w-0 truncate text-hrms-text-secondary ${highlightPhone ? LEADS_MATCH_HIGHLIGHT : ''}`}
          >
            {lead.phone || '—'}
          </dd>
        </div>
        <div className="flex gap-2 text-sm">
          <dt className="w-14 shrink-0 text-xs text-hrms-text-muted">Owner</dt>
          <dd className="min-w-0 truncate text-hrms-text-secondary">
            {lead.assignedEmployeeName ?? 'Unassigned'}
          </dd>
        </div>
      </dl>
      <div className="mt-2.5">
        <LeadStatusPill status={lead.status} />
      </div>
      <Button type="button" size="sm" variant="outline" className="mt-3 w-full" onClick={onOpen}>
        Open lead
      </Button>
    </div>
  )
}