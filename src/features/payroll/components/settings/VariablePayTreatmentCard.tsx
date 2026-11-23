/**
 * PF, ESI, and PT inclusion toggles per variable pay kind.
 * Used in Payroll Settings under variable pay rules group.
 */

import type { PayrollSettings, VariablePayKindTreatment } from '../../types/payrollSettings'
import type { VariablePayKind } from '../../types/variablePay'
import { SettingsCard } from './SettingsCard'

const KIND_LABELS: Record<VariablePayKind, string> = {
  overtime: 'Overtime',
  bonus: 'Bonus',
  incentive: 'Incentive',
}

type VariablePayTreatmentCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function VariablePayTreatmentCard({ draft, onChange }: VariablePayTreatmentCardProps) {
  function patchKind(kind: VariablePayKind, patch: Partial<VariablePayKindTreatment>) {
    onChange({
      ...draft,
      variablePayTreatment: {
        ...draft.variablePayTreatment,
        [kind]: { ...draft.variablePayTreatment[kind], ...patch },
      },
    })
  }

  return (
    <SettingsCard title="Statutory inclusion for variable pay">
      <p className="text-sm text-hrms-text-secondary">
        Choose whether approved overtime, bonus, and incentives count toward PF, ESI, and professional tax.
      </p>
      {(Object.keys(KIND_LABELS) as VariablePayKind[]).map((kind) => (
        <fieldset key={kind} className="space-y-2 border-t border-hrms-border pt-3 first:border-0 first:pt-0">
          <legend className="text-sm font-semibold text-hrms-navy">{KIND_LABELS[kind]}</legend>
          <ToggleRow
            label="Included in PF wages"
            checked={draft.variablePayTreatment[kind].includedInPfWages}
            onChange={(checked) => patchKind(kind, { includedInPfWages: checked })}
          />
          <ToggleRow
            label="Included in ESI wages"
            checked={draft.variablePayTreatment[kind].includedInEsiWages}
            onChange={(checked) => patchKind(kind, { includedInEsiWages: checked })}
          />
          <ToggleRow
            label="Included in professional tax gross"
            checked={draft.variablePayTreatment[kind].includedInProfessionalTaxGross}
            onChange={(checked) => patchKind(kind, { includedInProfessionalTaxGross: checked })}
          />
        </fieldset>
      ))}
      <p className="text-xs text-hrms-text-muted">TDS remains manual per employee.</p>
    </SettingsCard>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}
