/**
 * ESI configuration card on Payroll Settings.
 * Used by PayrollSettingsTab.
 */

import type { PayrollSettings } from '../../types/payrollSettings'
import { SettingsAmountField } from './SettingsAmountField'
import { SettingsCard } from './SettingsCard'
import { SettingsRateField } from './SettingsRateField'

type EsiSettingsCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function EsiSettingsCard({ draft, onChange }: EsiSettingsCardProps) {
  function patch(patch: Partial<PayrollSettings>) {
    onChange({ ...draft, ...patch })
  }

  return (
    <SettingsCard title="ESI">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.esiEnabled}
          onChange={(event) => patch({ esiEnabled: event.target.checked })}
        />
        Enabled
      </label>
      <SettingsAmountField
        id="esi-limit"
        label="Gross wage limit"
        value={draft.esiGrossLimit}
        onChange={(value) => patch({ esiGrossLimit: Number(value) })}
      />
      <SettingsRateField
        id="esi-employee"
        label="Employee rate"
        value={draft.esiEmployeeRate}
        onChange={(value) => patch({ esiEmployeeRate: Number(value) })}
      />
      <SettingsRateField
        id="esi-employer"
        label="Employer rate"
        value={draft.esiEmployerRate}
        onChange={(value) => patch({ esiEmployerRate: Number(value) })}
      />
    </SettingsCard>
  )
}
