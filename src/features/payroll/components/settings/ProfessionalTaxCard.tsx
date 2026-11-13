/**
 * Professional tax state dropdown and slab editor on Payroll Settings.
 * Used by PayrollSettingsTab.
 */

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { INDIAN_STATES } from '../../constants/indianStates'
import { SAMPLE_PT_SLAB_NOTE } from '../../constants/payrollRules'
import type { PayrollSettings, ProfessionalTaxSlab } from '../../types/payrollSettings'
import { ProfessionalTaxSlabRow } from './ProfessionalTaxSlabRow'
import { SettingsCard } from './SettingsCard'

type ProfessionalTaxCardProps = {
  draft: PayrollSettings
  slabErrorsById: Record<string, string>
  onChange: (next: PayrollSettings) => void
}

export function ProfessionalTaxCard({
  draft,
  slabErrorsById,
  onChange,
}: ProfessionalTaxCardProps) {
  function patch(patch: Partial<PayrollSettings>) {
    onChange({ ...draft, ...patch })
  }

  function updateSlab(index: number, slab: ProfessionalTaxSlab) {
    const slabs = structuredClone(draft.professionalTaxSlabs)
    slabs[index] = slab
    patch({ professionalTaxSlabs: slabs })
  }

  function addSlab() {
    patch({
      professionalTaxSlabs: [
        ...draft.professionalTaxSlabs,
        { id: `pt-${Date.now()}`, fromGross: 0, toGross: null, monthlyAmount: 0 },
      ],
    })
  }

  return (
    <SettingsCard title="Professional tax">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.professionalTaxEnabled}
          onChange={(event) => patch({ professionalTaxEnabled: event.target.checked })}
        />
        Enabled
      </label>
      <div>
        <Label htmlFor="pt-state">State</Label>
        <select
          id="pt-state"
          value={draft.professionalTaxState}
          onChange={(event) => patch({ professionalTaxState: event.target.value })}
          className="mt-1 h-11 w-full rounded-xl border border-hrms-border px-3 text-sm"
        >
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-hrms-text-muted">{SAMPLE_PT_SLAB_NOTE}</p>
      </div>
      {draft.professionalTaxSlabs.map((slab, index) => (
        <ProfessionalTaxSlabRow
          key={slab.id}
          slab={slab}
          error={slabErrorsById[slab.id]}
          onChange={(next) => updateSlab(index, next)}
          onRemove={() =>
            patch({
              professionalTaxSlabs: draft.professionalTaxSlabs.filter((_, i) => i !== index),
            })
          }
        />
      ))}
      <Button type="button" variant="outline" onClick={addSlab}>
        Add slab
      </Button>
    </SettingsCard>
  )
}
