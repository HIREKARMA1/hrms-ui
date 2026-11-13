/**
 * Leave encashment, notice recovery, and gratuity rule fields.
 * Used in Payroll Settings variable pay and settlement group.
 */

import type { PayrollSettings, WageBase } from '../../types/payrollSettings'
import { SettingsAmountField } from './SettingsAmountField'
import { SettingsCard } from './SettingsCard'
import { SettingsField } from './SettingsField'
import { Label } from '@/components/ui/label'

type FinalSettlementRulesCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function FinalSettlementRulesCard({ draft, onChange }: FinalSettlementRulesCardProps) {
  const rules = draft.finalSettlementRules

  function patch(patch: Partial<typeof rules>) {
    onChange({ ...draft, finalSettlementRules: { ...rules, ...patch } })
  }

  return (
    <SettingsCard title="Final settlement rules">
      <WageBaseSelect
        id="fs-leave-base"
        label="Leave encashment rate base"
        value={rules.leaveEncashmentRateBase}
        onChange={(value) => patch({ leaveEncashmentRateBase: value })}
      />
      <SettingsField
        id="fs-leave-divisor"
        label="Leave encashment day divisor"
        unit="days"
        value={rules.leaveEncashmentDayDivisor}
        onChange={(value) => patch({ leaveEncashmentDayDivisor: Number(value) })}
      />
      <WageBaseSelect
        id="fs-notice-base"
        label="Notice recovery rate base"
        value={rules.noticeRecoveryRateBase}
        onChange={(value) => patch({ noticeRecoveryRateBase: value })}
      />
      <SettingsField
        id="fs-notice-divisor"
        label="Notice recovery day divisor"
        unit="days"
        value={rules.noticeRecoveryDayDivisor}
        onChange={(value) => patch({ noticeRecoveryDayDivisor: Number(value) })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rules.gratuityEnabled}
          onChange={(event) => patch({ gratuityEnabled: event.target.checked })}
        />
        Gratuity enabled
      </label>
      <SettingsField
        id="fs-gratuity-years"
        label="Minimum years of service"
        unit="years"
        value={rules.gratuityMinYears}
        onChange={(value) => patch({ gratuityMinYears: Number(value) })}
      />
      <SettingsField
        id="fs-gratuity-days"
        label="Gratuity days per year"
        unit="days"
        value={rules.gratuityDaysPerYear}
        onChange={(value) => patch({ gratuityDaysPerYear: Number(value) })}
      />
      <SettingsField
        id="fs-gratuity-divisor"
        label="Gratuity day divisor"
        unit="days"
        value={rules.gratuityDayDivisor}
        onChange={(value) => patch({ gratuityDayDivisor: Number(value) })}
      />
      <SettingsAmountField
        id="fs-gratuity-max"
        label="Gratuity maximum amount"
        value={rules.gratuityMaxAmount}
        onChange={(value) => patch({ gratuityMaxAmount: Number(value) })}
      />
      <WageBaseSelect
        id="fs-gratuity-base"
        label="Gratuity wage base"
        value={rules.gratuityWageBase}
        onChange={(value) => patch({ gratuityWageBase: value })}
      />
    </SettingsCard>
  )
}

function WageBaseSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: WageBase
  onChange: (value: WageBase) => void
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="mt-1 h-10 w-full rounded-xl border border-hrms-border px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as WageBase)}
      >
        <option value="Basic">Basic</option>
        <option value="Gross">Gross</option>
      </select>
    </div>
  )
}
