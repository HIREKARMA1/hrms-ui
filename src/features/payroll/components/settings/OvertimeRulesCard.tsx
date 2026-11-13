/**
 * Overtime calculation rules card under variable pay settings group.
 * Used by PayrollSettingsTab save flow.
 */

import { Label } from '@/components/ui/label'

import type { PayrollSettings } from '../../types/payrollSettings'
import { SettingsCard } from './SettingsCard'
import { SettingsField } from './SettingsField'
import { SettingsRateField } from './SettingsRateField'

type OvertimeRulesCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function OvertimeRulesCard({ draft, onChange }: OvertimeRulesCardProps) {
  const rules = draft.overtimeRules

  function patchRules(patch: Partial<typeof rules>) {
    onChange({ ...draft, overtimeRules: { ...rules, ...patch } })
  }

  return (
    <SettingsCard title="Overtime rules">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rules.enabled}
          onChange={(event) => patchRules({ enabled: event.target.checked })}
        />
        Enabled
      </label>
      <SettingsRateField
        id="ot-multiplier"
        label="Rate multiplier"
        unit="x"
        value={rules.rateMultiplier}
        onChange={(value) => patchRules({ rateMultiplier: Number(value) })}
      />
      <div>
        <Label htmlFor="ot-rate-base">Rate base</Label>
        <select
          id="ot-rate-base"
          className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3 text-sm"
          value={rules.rateBase}
          onChange={(event) =>
            patchRules({ rateBase: event.target.value as 'Basic' | 'Gross' })
          }
        >
          <option value="Basic">Basic</option>
          <option value="Gross">Gross</option>
        </select>
      </div>
      <SettingsField
        id="ot-working-days"
        label="Working days per month (hourly rate)"
        unit="days"
        value={rules.workingDaysPerMonth}
        onChange={(value) => patchRules({ workingDaysPerMonth: Number(value) })}
      />
      <SettingsField
        id="ot-hours-day"
        label="Hours per day"
        unit="hrs"
        value={rules.hoursPerDay}
        onChange={(value) => patchRules({ hoursPerDay: Number(value) })}
      />
      <SettingsField
        id="ot-max-hours"
        label="Max overtime hours / month (blank = no limit)"
        unit="hrs"
        value={rules.maxHoursPerMonth ?? ''}
        onChange={(value) =>
          patchRules({
            maxHoursPerMonth: value === '' ? null : Number(value),
          })
        }
      />
    </SettingsCard>
  )
}
