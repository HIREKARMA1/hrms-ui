/**
 * Earnings and deductions lists with captions and manual line actions.
 * Used in SettlementDetailPanel for Draft and read-only states.
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { SettlementLine } from '../../types/finalSettlement'
import { formatCurrency } from '../../utils/formatCurrency'

type SettlementLinesSectionProps = {
  title: string
  lines: SettlementLine[]
  readOnly: boolean
  showTds?: boolean
  tds?: number
  onTdsChange?: (value: number) => void
  onAdd?: () => void
  onRemove?: (id: string) => void
}

export function SettlementLinesSection({
  title,
  lines,
  readOnly,
  showTds,
  tds,
  onTdsChange,
  onAdd,
  onRemove,
}: SettlementLinesSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-hrms-navy">{title}</h3>
        {!readOnly && onAdd ? (
          <Button type="button" size="sm" variant="outline" onClick={onAdd}>
            Add {title === 'Earnings' ? 'earning' : 'deduction'}
          </Button>
        ) : null}
      </div>
      <ul className="mt-2 space-y-2">
        {lines.map((line) => (
          <LineRow key={line.id} line={line} readOnly={readOnly} onRemove={onRemove} />
        ))}
        {showTds ? (
          <li className="flex items-center justify-between gap-2 py-1">
            <span className="text-hrms-text-secondary">TDS</span>
            {readOnly || !onTdsChange ? (
              <span className="tabular-nums">{formatCurrency(tds ?? 0)}</span>
            ) : (
              <Input
                type="number"
                className="max-w-[8rem] text-right tabular-nums"
                value={tds ?? 0}
                onChange={(e) => onTdsChange(Number(e.target.value))}
              />
            )}
          </li>
        ) : null}
      </ul>
    </section>
  )
}

function LineRow({
  line,
  readOnly,
  onRemove,
}: {
  line: SettlementLine
  readOnly: boolean
  onRemove?: (id: string) => void
}) {
  return (
    <li className="border-b border-hrms-border/40 pb-2">
      <div className="flex justify-between gap-2">
        <span className="text-hrms-text-secondary">{line.label}</span>
        {!line.infoOnly ? (
          <span className="tabular-nums">{formatCurrency(line.amount)}</span>
        ) : null}
        {!readOnly && line.manual && onRemove ? (
          <button type="button" className="text-xs text-hrms-danger" onClick={() => onRemove(line.id)}>
            Remove
          </button>
        ) : null}
      </div>
      {line.caption ? <p className="text-xs text-hrms-text-muted">{line.caption}</p> : null}
    </li>
  )
}
