/**
 * Validates professional tax slabs for gaps, overlaps, and open-ended rows.
 * Used by Payroll Settings form and per-row error display.
 */

import type { ProfessionalTaxSlab } from '../types/payrollSettings'

export type ProfessionalTaxSlabValidation = {
  globalErrors: string[]
  errorsBySlabId: Record<string, string>
}

export function validateProfessionalTaxSlabs(
  slabs: ProfessionalTaxSlab[],
): ProfessionalTaxSlabValidation {
  const globalErrors: string[] = []
  const errorsBySlabId: Record<string, string> = {}

  if (slabs.length === 0) {
    globalErrors.push('Add at least one professional tax slab.')
    return { globalErrors, errorsBySlabId }
  }

  const sorted = [...slabs].sort((a, b) => a.fromGross - b.fromGross)

  sorted.forEach((slab, index) => {
    if (slab.fromGross < 0) {
      errorsBySlabId[slab.id] = '"From gross" cannot be negative.'
    }
    if (slab.toGross !== null && slab.fromGross > slab.toGross) {
      errorsBySlabId[slab.id] = '"From gross" cannot exceed "To gross".'
    }
    if (slab.monthlyAmount < 0) {
      errorsBySlabId[slab.id] = 'Monthly amount cannot be negative.'
    }
    if (index > 0) {
      const previous = sorted[index - 1]
      if (previous.toGross === null) {
        errorsBySlabId[slab.id] = 'No slabs allowed after an open-ended range.'
      } else if (slab.fromGross <= previous.toGross) {
        errorsBySlabId[slab.id] = 'This range overlaps the previous slab.'
      } else if (slab.fromGross > previous.toGross + 1) {
        errorsBySlabId[slab.id] = 'Gap between this slab and the previous one.'
      }
    }
  })

  const openEnded = sorted.filter((slab) => slab.toGross === null)
  if (openEnded.length > 1) {
    globalErrors.push('Only one slab may have no upper limit.')
  }

  return { globalErrors, errorsBySlabId }
}
