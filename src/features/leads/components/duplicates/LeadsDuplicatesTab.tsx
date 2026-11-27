import { CheckCircle2, Copy } from 'lucide-react'
import { useMemo } from 'react'

import { useLeads } from '../../hooks/useLeads'
import { collectLeadDuplicatePairs } from '../../utils/leadDuplicatePairs'
import { LeadsOverviewCard } from '../overview/LeadsOverviewCard'
import { LeadsDuplicatePairCard } from './LeadsDuplicatePairCard'

export function LeadsDuplicatesTab() {
  const { leads, setSelectedLeadId } = useLeads()

  const pairs = useMemo(() => collectLeadDuplicatePairs(leads), [leads])

  const summary =
    pairs.length === 0
      ? `${leads.length} leads scanned — no matches`
      : `${pairs.length} possible duplicate ${pairs.length === 1 ? 'pair' : 'pairs'} · ${leads.length} leads scanned`

  return (
    <div className="space-y-2">
      <LeadsOverviewCard
        title="Duplicate review"
        subtitle="Matches when email, phone, or company name align. Compare and open each record to merge or close in your process."
      >
        <div className="space-y-3">
          <p className="text-sm text-hrms-text-secondary">{summary}</p>
          {pairs.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-dashed border-hrms-border bg-hrms-page px-3 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div className="text-sm">
                <p className="font-medium text-hrms-navy">No potential duplicates</p>
                <p className="mt-1 text-sm text-hrms-text-muted">
                  Every lead has a unique email, phone, and company name in the current list. Creating a lead with an
                  existing email or phone will appear here and warn on save.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {pairs.map((pair) => (
                <LeadsDuplicatePairCard
                  key={`${pair.leadA.id}-${pair.leadB.id}`}
                  pair={pair}
                  onOpenLead={setSelectedLeadId}
                />
              ))}
            </ul>
          )}
          <p className="flex items-start gap-2 border-t border-hrms-border/60 pt-3 text-xs text-hrms-text-muted">
            <Copy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Review matching leads and edit or delete duplicates as needed.
          </p>
        </div>
      </LeadsOverviewCard>
    </div>
  )
}