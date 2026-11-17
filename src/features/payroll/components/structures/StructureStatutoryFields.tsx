/**
 * PF rate and PT state overrides on a salary structure.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { PayrollSettings } from '../../types/payrollSettings'
import type { SalaryStructure, StructureStatutoryOverrides } from '../../types/salaryStructure'
import {
  DEFAULT_STRUCTURE_STATUTORY_OVERRIDES,
  listConfiguredProfessionalTaxStates,
} from '../../utils/structureStatutory'

type StructureStatutoryFieldsProps = {
  draft: SalaryStructure
  settings: PayrollSettings
  onChange: (next: SalaryStructure) => void
}

export function StructureStatutoryFields({ draft, settings, onChange }: StructureStatutoryFieldsProps) {
  const overrides = draft.statutoryOverrides ?? DEFAULT_STRUCTURE_STATUTORY_OVERRIDES
  const ptStates = listConfiguredProfessionalTaxStates(settings)

  function patchOverrides(patch: Partial<StructureStatutoryOverrides>) {
    onChange({
      ...draft,
      statutoryOverrides: { ...overrides, ...patch },
    })
  }

  return (
    <div className="space-y-4 rounded-xl border border-hrms-border bg-hrms-page p-4">
      <p className="font-semibold text-hrms-navy">Statutory overrides</p>
      <p className="text-xs text-hrms-text-muted">
        Leave blank to use company defaults from Payroll Settings (
        {settings.pfEmployeeRate}% / {settings.pfEmployerRate}% PF, {settings.professionalTaxState}{' '}
        PT).
      </p>
      {draft.flags.pfApplicable ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="pf-employee-rate-override">Employee PF % (custom)</Label>
            <Input
              id="pf-employee-rate-override"
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder={String(settings.pfEmployeeRate)}
              value={overrides.pfEmployeeRate ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                patchOverrides({
                  pfEmployeeRate: raw === '' ? null : Number(raw),
                })
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pf-employer-rate-override">Employer PF % (custom)</Label>
            <Input
              id="pf-employer-rate-override"
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder={String(settings.pfEmployerRate)}
              value={overrides.pfEmployerRate ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                patchOverrides({
                  pfEmployerRate: raw === '' ? null : Number(raw),
                })
              }}
              className="mt-1"
            />
          </div>
        </div>
      ) : null}
      {draft.flags.professionalTaxApplicable ? (
        <div>
          <Label htmlFor="pt-state-override">Professional tax state</Label>
          <select
            id="pt-state-override"
            value={overrides.professionalTaxState ?? ''}
            onChange={(event) => {
              const value = event.target.value
              patchOverrides({
                professionalTaxState: value === '' ? null : value,
              })
            }}
            className="mt-1 h-11 w-full rounded-xl border border-hrms-border px-3 text-sm"
          >
            <option value="">Company default ({settings.professionalTaxState})</option>
            {ptStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  )
}