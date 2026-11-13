/**
 * Loss of pay basis, pay day, and TDS mode on Payroll Settings.
 * Used by PayrollSettingsTab.
 */

import type { LossOfPayBasis, PayrollSettings } from '../../types/payrollSettings'
import { SettingsCard } from './SettingsCard'
import { SettingsField } from './SettingsField'

type PayrollCycleCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function PayrollCycleCard({ draft, onChange }: PayrollCycleCardProps) {
  function patch(patch: Partial<PayrollSettings>) {
    onChange({ ...draft, ...patch })
  }

  return (
    <SettingsCard title="Payroll cycle & TDS">
      <div>
        <label htmlFor="lop-basis" className="text-sm font-medium text-hrms-navy">
          Loss of pay day basis
        </label>
        <select
          id="lop-basis"
          value={draft.lossOfPayBasis}
          onChange={(event) =>
            patch({ lossOfPayBasis: event.target.value as LossOfPayBasis })
          }
          className="mt-1 h-11 w-full rounded-xl border border-hrms-border px-3 text-sm"
        >
          <option value="calendar_days">Calendar days in month</option>
          <option value="fixed_30">Fixed 30 days</option>
          <option value="working_days">Working days</option>
        </select>
      </div>
      {draft.lossOfPayBasis === 'working_days' ? (
        <SettingsField
          id="working-days"
          label="Working days per month"
          unit="days"
          value={draft.workingDaysPerMonth}
          onChange={(value) => patch({ workingDaysPerMonth: Number(value) })}
        />
      ) : null}
      <SettingsField
        id="pay-day"
        label="Pay day of month"
        value={draft.payDayOfMonth}
        onChange={(value) => patch({ payDayOfMonth: Number(value) })}
      />
      <p className="text-sm text-hrms-text-muted">
        TDS: manual amount per employee (configured on each employee record).
      </p>
    </SettingsCard>
  )
}
