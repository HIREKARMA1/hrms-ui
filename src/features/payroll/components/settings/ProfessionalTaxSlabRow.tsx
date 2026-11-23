/**
 * One professional tax slab row with compact inputs and remove control.
 * Used by ProfessionalTaxCard on Payroll Settings.
 */

import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ProfessionalTaxSlab } from '../../types/payrollSettings'
import { SettingsAmountField } from './SettingsAmountField'

type ProfessionalTaxSlabRowProps = {
  slab: ProfessionalTaxSlab
  error?: string
  onChange: (next: ProfessionalTaxSlab) => void
  onRemove: () => void
}

export function ProfessionalTaxSlabRow({
  slab,
  error,
  onChange,
  onRemove,
}: ProfessionalTaxSlabRowProps) {
  function parseToGross(value: string): number | null {
    return value.trim() === '' ? null : Number(value)
  }

  return (
    <div className="rounded-lg border border-hrms-border p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <SettingsAmountField
          id={`from-${slab.id}`}
          label="From gross"
          value={slab.fromGross}
          onChange={(value) => onChange({ ...slab, fromGross: Number(value) })}
        />
        <SettingsAmountField
          id={`to-${slab.id}`}
          label="To gross"
          value={slab.toGross ?? ''}
          placeholder="No upper limit"
          onChange={(value) => onChange({ ...slab, toGross: parseToGross(value) })}
        />
        <SettingsAmountField
          id={`monthly-${slab.id}`}
          label="Monthly amount"
          value={slab.monthlyAmount}
          onChange={(value) => onChange({ ...slab, monthlyAmount: Number(value) })}
        />
        <SettingsAmountField
          id={`feb-${slab.id}`}
          label="February amount (optional)"
          value={slab.februaryAmount ?? ''}
          onChange={(value) =>
            onChange({
              ...slab,
              februaryAmount: value.trim() === '' ? undefined : Number(value),
            })
          }
        />
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        {error ? (
          <p className="text-xs text-hrms-danger" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Remove slab"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
