/**
 * Structure component inputs, flags, and save with required reason.
 * Used in StructureDetailPanel Structure tab.
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SALARY_COMPONENT_IDS, SALARY_COMPONENT_LABELS } from '../../constants/salaryComponents'
import type { PayrollSettings } from '../../types/payrollSettings'
import type { SalaryStructure } from '../../types/salaryStructure'
import { StructureLivePreview } from './StructureLivePreview'
import type { ComputedPayroll } from '../../types/payroll'

type StructureEditorTabProps = {
  draft: SalaryStructure
  settings: PayrollSettings
  preview: ComputedPayroll
  reason: string
  onReasonChange: (value: string) => void
  onChange: (next: SalaryStructure) => void
  onSave: () => void
}

export function StructureEditorTab({
  draft,
  settings,
  preview,
  reason,
  onReasonChange,
  onChange,
  onSave,
}: StructureEditorTabProps) {
  function updateValue(id: (typeof SALARY_COMPONENT_IDS)[number], value: number) {
    onChange({
      ...draft,
      componentValues: { ...draft.componentValues, [id]: value },
    })
  }

  function updateFlag(key: keyof SalaryStructure['flags'], value: boolean) {
    onChange({ ...draft, flags: { ...draft.flags, [key]: value } })
  }

  return (
    <div className="space-y-5 text-sm">
      {SALARY_COMPONENT_IDS.map((id) => {
        const def = settings.salaryComponents.find((item) => item.id === id)
        return (
          <div key={id}>
            <Label htmlFor={`comp-${id}`}>
              {SALARY_COMPONENT_LABELS[id]}
              {def?.calculationType === 'percent_of_basic' ? ' (% of Basic)' : ''}
            </Label>
            <Input
              id={`comp-${id}`}
              type="number"
              value={draft.componentValues[id]}
              onChange={(event) => updateValue(id, Number(event.target.value))}
              className="mt-1"
            />
          </div>
        )
      })}
      <div className="space-y-2">
        {(['pfApplicable', 'esiApplicable', 'professionalTaxApplicable'] as const).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.flags[key]}
              onChange={(event) => updateFlag(key, event.target.checked)}
            />
            {key.replace('Applicable', ' applicable')}
          </label>
        ))}
      </div>
      <div>
        <Label htmlFor="effective-from">Effective from</Label>
        <Input
          id="effective-from"
          type="date"
          value={draft.effectiveFrom}
          onChange={(event) => onChange({ ...draft, effectiveFrom: event.target.value })}
          className="mt-1"
        />
      </div>
      <StructureLivePreview preview={preview} />
      <div>
        <Label htmlFor="revision-reason">Revision reason (required)</Label>
        <Input
          id="revision-reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="button" onClick={onSave} disabled={reason.trim().length === 0}>
        Save new revision
      </Button>
    </div>
  )
}
