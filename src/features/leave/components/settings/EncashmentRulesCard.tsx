/**
 * Encashment limits and read-only team coverage summary on Leave Settings.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { LeaveSettings } from '../../types/leaveSettings'

type EncashmentRulesCardProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function EncashmentRulesCard({ draft, onChange }: EncashmentRulesCardProps) {
  return (
    <Card className="h-fit w-full">
      <CardHeader>
        <CardTitle className="text-base">Encashment and coverage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="block">
          Minimum balance to keep
          <input
            type="number"
            className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
            value={draft.encashmentRules.minimumBalanceDays}
            onChange={(event) =>
              onChange({
                ...draft,
                encashmentRules: { ...draft.encashmentRules, minimumBalanceDays: Number(event.target.value) },
              })
            }
          />
          <span className="text-xs text-hrms-text-muted">days</span>
        </label>
        <label className="block">
          Max encashment per year
          <input
            type="number"
            className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3"
            value={draft.encashmentRules.maximumDaysPerYear}
            onChange={(event) =>
              onChange({
                ...draft,
                encashmentRules: { ...draft.encashmentRules, maximumDaysPerYear: Number(event.target.value) },
              })
            }
          />
          <span className="text-xs text-hrms-text-muted">days</span>
        </label>
        <p className="text-xs text-hrms-text-muted">
          Team coverage: max {draft.teamCoverage.maxSameDepartmentPerDay} per department ({draft.teamCoverage.mode}).
          Escalation after {draft.escalation.daysPendingBeforeEscalation} days.
        </p>
      </CardContent>
    </Card>
  )
}
