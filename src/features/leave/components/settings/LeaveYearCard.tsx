/**
 * Leave year, weekly off, sandwich rule, and probation settings card.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { LeaveSettings } from '../../types/leaveSettings'

type LeaveYearCardProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function LeaveYearCard({ draft, onChange }: LeaveYearCardProps) {
  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-base">Leave year and week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="block">
          Leave year
          <select
            className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
            value={draft.leaveYearMode}
            onChange={(event) => onChange({ ...draft, leaveYearMode: event.target.value as LeaveSettings['leaveYearMode'] })}
          >
            <option value="jan_dec">Jan to Dec</option>
            <option value="apr_mar">Apr to Mar</option>
          </select>
        </label>
        <label className="block">
          Sandwich rule
          <select
            className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
            value={draft.sandwichRule}
            onChange={(event) => onChange({ ...draft, sandwichRule: event.target.value as LeaveSettings['sandwichRule'] })}
          >
            <option value="exclude">Do not count weekly offs and holidays between leave days</option>
            <option value="count">Count weekly offs and holidays between leave days</option>
          </select>
        </label>
        <label className="block">
          Minimum probation months
          <input
            type="number"
            className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
            value={draft.minProbationMonths}
            onChange={(event) => onChange({ ...draft, minProbationMonths: Number(event.target.value) })}
          />
          <span className="text-xs text-hrms-text-muted">months</span>
        </label>
        <p className="text-xs text-hrms-text-muted">Weekly off: Sunday (seed). Edit in a future rules card.</p>
      </CardContent>
    </Card>
  )
}
