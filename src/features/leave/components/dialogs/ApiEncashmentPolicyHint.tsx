import type { EncashmentPolicyRule } from '../../utils/encashmentRequestPolicy'

type Props = {
  rule: EncashmentPolicyRule | null
  loading?: boolean
}

export function ApiEncashmentPolicyHint({ rule, loading }: Props) {
  if (loading) {
    return <p className="text-xs text-hrms-text-muted">Loading encashment policy rules…</p>
  }
  if (!rule) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        No active encashment policy applies to this leave type for today. Choose another type or contact HR.
      </p>
    )
  }
  const maxYear = rule.maxDaysPerYear === null ? 'No yearly cap' : `${rule.maxDaysPerYear} days / year`
  return (
    <p className="rounded-lg border border-hrms-border bg-hrms-muted-bg/50 px-3 py-2 text-xs text-hrms-text-secondary">
      Policy: {rule.rateLabel ?? 'Rate set by HR'} · Max {rule.maxDaysPerRequest || '—'} days per request ·{' '}
      {maxYear} · Keep at least {rule.minDaysAfter} day{rule.minDaysAfter === 1 ? '' : 's'} after encashment.
    </p>
  )
}