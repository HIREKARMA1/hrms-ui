/**
 * Summary and timeline blocks for the settlement sheet body.
 * Used by SettlementDetailPanel.
 */

import type { FinalSettlement } from '../../types/finalSettlement'
import { formatDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

export function SettlementSummaryBlock({ draft }: { draft: FinalSettlement }) {
  return (
    <section className="space-y-2 rounded-xl bg-hrms-page p-4">
      <MoneyRow label="Total earnings" value={draft.totalEarnings} />
      <MoneyRow label="Total deductions" value={draft.totalDeductions} />
      <MoneyRow label="Net payable" value={draft.netPayable} highlight />
    </section>
  )
}

export function SettlementTimelineBlock({ draft }: { draft: FinalSettlement }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-hrms-navy">Timeline</h3>
      <ul className="space-y-2 text-sm text-hrms-text-secondary">
        {draft.timeline.map((entry) => (
          <li key={`${entry.stage}-${entry.date}`} className="whitespace-nowrap">
            {entry.stage} · {entry.actor} · {formatDate(entry.date)}
            {entry.note ? ` — ${entry.note}` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}

function MoneyRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={
        highlight
          ? 'flex justify-between gap-3 rounded-lg bg-hrms-lavender px-3 py-2'
          : 'flex justify-between gap-3 py-1'
      }
    >
      <span className={highlight ? 'font-semibold text-hrms-navy' : 'text-hrms-text-secondary'}>
        {label}
      </span>
      <span
        className={`tabular-nums ${highlight ? 'text-xl font-bold text-hrms-navy' : 'text-hrms-navy'}`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}
