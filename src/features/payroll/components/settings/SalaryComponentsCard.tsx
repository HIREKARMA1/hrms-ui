/**
 * Editable list of fixed salary components in Payroll Settings.
 * Used by PayrollSettingsTab.
 */

import type { PayrollSettings } from '../../types/payrollSettings'
import { SettingsCard } from './SettingsCard'
import { SettingsField } from './SettingsField'

type SalaryComponentsCardProps = {
  draft: PayrollSettings
  onChange: (next: PayrollSettings) => void
}

export function SalaryComponentsCard({ draft, onChange }: SalaryComponentsCardProps) {
  function updateComponent(index: number, field: string, value: string | boolean) {
    const next = structuredClone(draft)
    const row = next.salaryComponents[index]
    if (field === 'defaultValue') {
      row.defaultValue = Number(value)
    }
    if (field === 'calculationType') {
      row.calculationType = value as 'fixed' | 'percent_of_basic'
    }
    if (field === 'includedInPfWages') {
      row.includedInPfWages = Boolean(value)
    }
    if (field === 'includedInEsiWages') {
      row.includedInEsiWages = Boolean(value)
    }
    onChange(next)
  }

  return (
    <SettingsCard title="Pay components (template)">
      <p className="text-sm text-hrms-text-secondary">
        Defaults for new structures only. Set each employee&apos;s amounts under Salary Structures.
      </p>
      {draft.salaryComponents.map((component, index) => (
        <div key={component.id} className="space-y-2 rounded-xl border border-hrms-border p-3">
          <p className="font-semibold text-hrms-navy">{component.label}</p>
          <SettingsField
            id={`${component.id}-default`}
            label={
              component.calculationType === 'percent_of_basic' ? 'Default % of Basic' : 'Default amount'
            }
            value={component.defaultValue}
            onChange={(value) => updateComponent(index, 'defaultValue', value)}
          />
          <label className="flex items-center gap-2 text-sm text-hrms-text-secondary">
            <input
              type="checkbox"
              checked={component.includedInPfWages}
              disabled={component.id === 'basic'}
              onChange={(event) =>
                updateComponent(index, 'includedInPfWages', event.target.checked)
              }
            />
            Included in PF wages
          </label>
          <label className="flex items-center gap-2 text-sm text-hrms-text-secondary">
            <input
              type="checkbox"
              checked={component.includedInEsiWages}
              onChange={(event) =>
                updateComponent(index, 'includedInEsiWages', event.target.checked)
              }
            />
            Included in ESI wages
          </label>
        </div>
      ))}
    </SettingsCard>
  )
}
