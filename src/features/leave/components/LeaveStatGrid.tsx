/**
 * Four-up stat card row shared by leave tabs (payroll-style grid).
 * Used under LeaveTabHeader on My Leave, Approvals, and Balances.
 */

import { Card, CardContent } from '@/components/ui/card'

export type LeaveStatItem = {
  label: string
  value: string
  hint?: string
}

type LeaveStatGridProps = {
  items: LeaveStatItem[]
}

export function LeaveStatGrid({ items }: LeaveStatGridProps) {
  const slice = items.slice(0, 4)
  while (slice.length < 4) {
    slice.push({ label: '—', value: '—' })
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {slice.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-5">
            <p className="text-sm text-hrms-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-hrms-navy">{item.value}</p>
            {item.hint ? <p className="mt-1 text-xs text-hrms-text-muted">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
