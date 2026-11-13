/**
 * Statutory bonus rule fields in Payroll Settings variable pay group.
 * Used by PayrollSettingsTab with the shared save bar.
 */

import type { PayrollSettings } from '../../types/payrollSettings'
import { SettingsAmountField } from './SettingsAmountField'
import { SettingsCard } from './SettingsCard'
import { SettingsRateField } from './SettingsRateField'
import { Label } from '@/components/ui/label'

type BonusRulesCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function BonusRulesCard({ draft, onChange }: BonusRulesCardProps) {
  const rules = draft.bonusRules

  function patchRules(patch: Partial<typeof rules>) {
    onChange({ ...draft, bonusRules: { ...rules, ...patch } })
  }

  return (
    <SettingsCard title="Bonus rules">
      <SettingsRateField
        id="bonus-percent"
        label="Statutory bonus percentage"
        value={rules.statutoryBonusPercent}
        onChange={(value) => patchRules({ statutoryBonusPercent: Number(value) })}
      />
      <SettingsAmountField
        id="bonus-eligibility"
        label="Eligibility salary limit"
        value={rules.eligibilitySalaryLimit}
        onChange={(value) => patchRules({ eligibilitySalaryLimit: Number(value) })}
      />
      <SettingsAmountField
        id="bonus-ceiling"
        label="Calculation wage ceiling"
        value={rules.calculationWageCeiling}
        onChange={(value) => patchRules({ calculationWageCeiling: Number(value) })}
      />
      <div>
        <Label htmlFor="bonus-wage-base">Bonus wage base</Label>
        <select
          id="bonus-wage-base"
          className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3 text-sm"
          value={rules.bonusWageBase}
          onChange={(event) =>
            patchRules({ bonusWageBase: event.target.value as 'Basic' | 'Gross' })
          }
        >
          <option value="Basic">Basic</option>
          <option value="Gross">Gross</option>
        </select>
      </div>
    </SettingsCard>
  )
}
