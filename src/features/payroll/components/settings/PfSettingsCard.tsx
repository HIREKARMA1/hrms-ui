/**
 * Provident Fund configuration card on Payroll Settings.
 * Used by PayrollSettingsTab.
 */

import type { PayrollSettings } from '../../types/payrollSettings'
import { SettingsAmountField } from './SettingsAmountField'
import { SettingsCard } from './SettingsCard'
import { SettingsRateField } from './SettingsRateField'

type PfSettingsCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function PfSettingsCard({ draft, onChange }: PfSettingsCardProps) {
  function patch(patch: Partial<PayrollSettings>) {
    onChange({ ...draft, ...patch })
  }

  return (
    <SettingsCard title="Provident Fund">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.pfEnabled}
          onChange={(event) => patch({ pfEnabled: event.target.checked })}
        />
        Enabled
      </label>
      <SettingsRateField
        id="pf-employee-rate"
        label="Employee rate"
        value={draft.pfEmployeeRate}
        onChange={(value) => patch({ pfEmployeeRate: Number(value) })}
      />
      <SettingsRateField
        id="pf-employer-rate"
        label="Employer rate"
        value={draft.pfEmployerRate}
        onChange={(value) => patch({ pfEmployerRate: Number(value) })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.pfApplyCeiling}
          onChange={(event) => patch({ pfApplyCeiling: event.target.checked })}
        />
        Apply wage ceiling
      </label>
      <SettingsAmountField
        id="pf-ceiling"
        label="PF wage ceiling"
        value={draft.pfWageCeiling}
        onChange={(value) => patch({ pfWageCeiling: Number(value) })}
      />
    </SettingsCard>
  )
}
