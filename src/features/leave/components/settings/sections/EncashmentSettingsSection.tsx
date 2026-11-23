/**
 * Encashment limits with interactive "Try it" preview.
 */

import { useState } from 'react'

import type { LeaveSettings } from '../../../types/leaveSettings'
import { SettingsField } from '../shared/SettingsField'
import { SettingsNumberInput } from '../shared/SettingsNumberInput'

type EncashmentSettingsSectionProps = {
  draft: LeaveSettings
  onChange: (next: LeaveSettings) => void
}

export function EncashmentSettingsSection({ draft, onChange }: EncashmentSettingsSectionProps) {
  const [sampleBalance, setSampleBalance] = useState(25)
  const maxEncash = Math.max(0, sampleBalance - draft.encashmentRules.minimumBalanceDays)
  const capped = Math.min(maxEncash, draft.encashmentRules.maximumDaysPerYear)

  return (
    <div className="space-y-6">
      <SettingsField label="Minimum balance to keep" helper="Employees must keep at least this many days after cash payout.">
        <SettingsNumberInput
          value={draft.encashmentRules.minimumBalanceDays}
          onChange={(minimumBalanceDays) => onChange({ ...draft, encashmentRules: { ...draft.encashmentRules, minimumBalanceDays } })}
          unit="days"
          min={0}
        />
      </SettingsField>
      <SettingsField label="Maximum days paid out per year" helper="Cap on how many days can be paid out in one leave year.">
        <SettingsNumberInput
          value={draft.encashmentRules.maximumDaysPerYear}
          onChange={(maximumDaysPerYear) => onChange({ ...draft, encashmentRules: { ...draft.encashmentRules, maximumDaysPerYear } })}
          unit="days"
          min={0}
        />
      </SettingsField>
      <div className="rounded-xl border border-hrms-border bg-hrms-lavender/40 p-4 text-sm text-hrms-navy">
        <p className="font-medium">Try it</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span>With a balance of</span>
          <SettingsNumberInput value={sampleBalance} onChange={setSampleBalance} unit="days" min={0} />
          <span>, an employee can be paid out for up to {capped} days.</span>
        </div>
      </div>
      <p className="text-sm text-hrms-text-secondary">The pay rate for leave encashment is set in the Payroll module (final settlement rules).</p>
    </div>
  )
}
